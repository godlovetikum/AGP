import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import App from '../App';

describe('AGP register', () => {
  it('loads the register and opens the new account form', async () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(<App />);
      await Promise.resolve();
    });

    expect(renderer.root.findByProps({children: 'AGP'})).toBeTruthy();
    expect(renderer.root.findByProps({children: 'OFFLINE DIGITAL ACCOUNT REGISTER'})).toBeTruthy();
    expect(renderer.root.findByProps({children: '+ Add'})).toBeTruthy();

    const addButton = renderer.root.findByProps({testID: 'add-account-button'});
    expect(addButton).toBeTruthy();

    await act(async () => {
      addButton.props.onPress();
      await Promise.resolve();
    });

    expect(renderer.root.findByProps({children: 'New account record'})).toBeTruthy();
    expect(renderer.root.findByProps({children: 'Save record'})).toBeTruthy();
  });
});
