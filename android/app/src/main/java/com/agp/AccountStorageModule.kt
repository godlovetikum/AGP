package com.agp

import android.app.Activity
import android.app.KeyguardManager
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.nio.charset.StandardCharsets
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class AccountStorageModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private val preferences = context.getSharedPreferences(PREFERENCES_NAME, 0)
  override fun getName(): String = MODULE_NAME
  @ReactMethod fun load(promise: Promise) = promise.resolve(preferences.getString(DATA_KEY, "{}") ?: "{}")
  @ReactMethod fun save(value: String, promise: Promise) { preferences.edit().putString(DATA_KEY, value).apply(); promise.resolve(true) }
  @ReactMethod fun secureSave(id: String, value: String, promise: Promise) { try { preferences.edit().putString(SECRET_PREFIX + id, encrypt(value)).apply(); promise.resolve(true) } catch (error: Exception) { promise.reject("SECURE_SAVE_FAILED", error) } }
  @ReactMethod fun secureLoad(id: String, promise: Promise) { try { promise.resolve(decrypt(preferences.getString(SECRET_PREFIX + id, "") ?: "")) } catch (error: Exception) { promise.reject("SECURE_LOAD_FAILED", error) } }
  @ReactMethod fun secureDelete(id: String, promise: Promise) { preferences.edit().remove(SECRET_PREFIX + id).apply(); promise.resolve(true) }
  @ReactMethod fun setClipboard(value: String, promise: Promise) { val clipboard = reactApplicationContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager; val clip = ClipData.newPlainText("AGP", value); clipboard.setPrimaryClip(clip); Handler(Looper.getMainLooper()).postDelayed({ if (clipboard.hasPrimaryClip() && clipboard.primaryClip?.getItemAt(0)?.text == value) clipboard.clearPrimaryClip() }, 30_000); promise.resolve(true) }
  @ReactMethod fun authenticateBiometric(promise: Promise) {
    val activity = currentActivity as? Activity
    if (activity == null) { promise.reject("NO_ACTIVITY", "AGP is not attached to an Activity"); return }
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) { promise.resolve(false); return }
    val keyguard = activity.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
    if (!keyguard.isKeyguardSecure) { promise.resolve(false); return }
    val executor = activity.mainExecutor
    val cancellationSignal = CancellationSignal()
    val prompt = BiometricPrompt.Builder(activity)
      .setTitle("Unlock AGP")
      .setSubtitle("Verify your identity")
      .setNegativeButton("Use PIN", executor) { _, _ -> promise.resolve(false) }
      .build()
    prompt.authenticate(cancellationSignal, executor, object : BiometricPrompt.AuthenticationCallback() {
      override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) { promise.resolve(true) }
      override fun onAuthenticationError(errorCode: Int, errString: CharSequence) { promise.resolve(false) }
      override fun onAuthenticationFailed() { }
    })
  }
  @ReactMethod fun getPin(promise: Promise) = promise.resolve(preferences.getString(PIN_KEY, "") ?: "")
  @ReactMethod fun setPin(value: String, promise: Promise) { preferences.edit().putString(PIN_KEY, if (value.isBlank()) "" else hash(value)).apply(); promise.resolve(true) }
  @ReactMethod fun verifyPin(value: String, promise: Promise) { promise.resolve(value.isNotBlank() && hash(value) == preferences.getString(PIN_KEY, "")) }
  private fun hash(value: String): String = java.security.MessageDigest.getInstance("SHA-256").digest(value.toByteArray()).joinToString("") { "%02x".format(it) }
  private fun key(): SecretKey { val store = KeyStore.getInstance(KEYSTORE).apply { load(null) }; if (!store.containsAlias(KEY_ALIAS)) { KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE).apply { init(KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build()); generateKey() } }; return (store.getEntry(KEY_ALIAS, null) as KeyStore.SecretKeyEntry).secretKey }
  private fun encrypt(value: String): String { val cipher = Cipher.getInstance(TRANSFORMATION); cipher.init(Cipher.ENCRYPT_MODE, key()); return Base64.encodeToString(cipher.iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(cipher.doFinal(value.toByteArray(StandardCharsets.UTF_8)), Base64.NO_WRAP) }
  private fun decrypt(value: String): String { if (value.isBlank()) return ""; val parts = value.split(":"); val cipher = Cipher.getInstance(TRANSFORMATION); cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP))); return String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), StandardCharsets.UTF_8) }
  private companion object { const val MODULE_NAME = "AccountStorage"; const val PREFERENCES_NAME = "agp_preferences"; const val DATA_KEY = "records_json_v1"; const val PIN_KEY = "pin_hash_v1"; const val SECRET_PREFIX = "secret_"; const val KEYSTORE = "AndroidKeyStore"; const val KEY_ALIAS = "agp_secure_key"; const val TRANSFORMATION = "AES/GCM/NoPadding" }
}
