import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import App from '../App';

describe('Account Register', () => {
  it('shows the sample record and can open the add form', async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });

    expect(renderer!.root.findByProps({children: 'Account Register'})).toBeTruthy();
    expect(renderer!.root.findByProps({children: '@examplebrand'})).toBeTruthy();

    const addButton = renderer!.root.findAll(
      node => typeof node.props.onPress === 'function',
    )[0];
    act(() => addButton.props.onPress());

    expect(renderer!.root.findByProps({children: 'New account record'})).toBeTruthy();
    expect(renderer!.root.findByProps({children: 'Save record'})).toBeTruthy();
  });
});
