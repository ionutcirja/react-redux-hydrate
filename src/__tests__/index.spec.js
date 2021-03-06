// @flow
import React from 'react';
import { shallow } from 'enzyme';
import hydrate from '..';

describe('hydrate hoc', () => {
  const Component = () => <span>content</span>;
  const LoadingIndicator = () => <span>spinner</span>;
  type ErrorProps = {
    error: string,
  };
  const ErrorWrapper = ({ error }: ErrorProps) => <span>{error}</span>;
  
  let propsToRender;
  
  beforeEach(() => {
    propsToRender = {
      otherProp: 'some value',
      error: 'some error',
      actions: {
        someAction: jest.fn(),
        group: {
          groupAction: jest.fn(),
        },
        anotherGroup: {
          anotherGroupAction: jest.fn(),
        },
      },
      someProp: {
        value: 50,
      },
      anotherProp: 'str',
    };
  });
  
  describe('render', () => {
    it('should render a spinner on first time render', () => {
      const HOCComponent = hydrate({
        WrappedComponent: Component,
        LoadingIndicator,
        ErrorWrapper,
        hydrationActions: ['someAction', 'group.groupAction'],
      });
      const wrapper = shallow(<HOCComponent {...propsToRender} />).dive();
      expect(wrapper.find('span').text()).toEqual('spinner');
    });
    
    it('should render a spinner if loading prop value is truthy', () => {
      propsToRender.loading = true;
      const HOCComponent = hydrate({
        WrappedComponent: Component,
        LoadingIndicator,
        ErrorWrapper,
        hydrationActions: ['someAction', 'group.groupAction'],
      });
      const wrapper = shallow(<HOCComponent {...propsToRender} />).dive();
      expect(wrapper.find('span').text()).toEqual('spinner');
    });
    
    it('should render an error if loading is done and an error prop is received', () => {
      propsToRender.loading = false;
      propsToRender.error = 'some error';
      const HOCComponent = hydrate({
        WrappedComponent: Component,
        LoadingIndicator,
        ErrorWrapper,
        hydrationActions: ['someAction', 'group.groupAction'],
      });
      const wrapper = shallow(<HOCComponent {...propsToRender} />);
      wrapper.instance().forceUpdate();
      expect(wrapper.dive().find('span').text()).toEqual(propsToRender.error);
    });
    
    it('should render a component if loading is done and no error prop is received', () => {
      propsToRender.loading = false;
      propsToRender.error = '';
      const HOCComponent = hydrate({
        WrappedComponent: Component,
        LoadingIndicator,
        ErrorWrapper,
        hydrationActions: ['someAction', 'group.groupAction'],
      });
      const wrapper = shallow(<HOCComponent {...propsToRender} />);
      wrapper.instance().forceUpdate();
      expect(wrapper.dive().find('span').text()).toEqual('content');
    });
  });
  
  describe('componentDidMount', () => {
    it('should call the actions methods with the proper props params', () => {
      const HOCComponent = hydrate({
        WrappedComponent: Component,
        LoadingIndicator,
        ErrorWrapper,
        hydrationActions: [
          'someAction',
          {
            action: 'group.groupAction',
            params: 'someProp.value',
          },
          {
            action: 'anotherGroup.anotherGroupAction',
            params: ['someProp.value', 'anotherProp'],
          },
        ],
      });
      shallow(<HOCComponent {...propsToRender} />);
      expect(propsToRender.actions.someAction).toHaveBeenCalled();
      expect(propsToRender.actions.group.groupAction).toHaveBeenCalledWith({
        value: 50,
      });
      expect(propsToRender.actions.anotherGroup.anotherGroupAction).toHaveBeenCalledWith({
        value: 50,
        anotherProp: 'str',
      });
    });
    
    it('should render an error if action is not defined', () => {
      const HOCComponent = hydrate({
        WrappedComponent: Component,
        LoadingIndicator,
        ErrorWrapper,
        hydrationActions: [
          'undefinedAction',
        ],
      });
      const wrapper = shallow(<HOCComponent {...propsToRender} />);
      expect(wrapper.find('p').text()).toEqual(
        'undefinedAction is not an action. Check your container mapDispatchToProps configuration.',
      );
    });
  });
});
