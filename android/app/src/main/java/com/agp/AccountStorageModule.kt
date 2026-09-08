package com.agp

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AccountStorageModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private val preferences = context.getSharedPreferences(PREFERENCES_NAME, 0)

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun load(promise: Promise) {
    promise.resolve(preferences.getString(DATA_KEY, "[]") ?: "[]")
  }

  @ReactMethod
  fun save(value: String, promise: Promise) {
    preferences.edit().putString(DATA_KEY, value).apply()
    promise.resolve(true)
  }

  private companion object {
    const val MODULE_NAME = "AccountStorage"
    const val PREFERENCES_NAME = "agp_preferences"
    const val DATA_KEY = "records_json_v1"
  }
}
