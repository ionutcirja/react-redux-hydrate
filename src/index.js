// @flow
import React, { Component } from 'react';
import type { ComponentType } from 'react';

type Params = string | Array<string>;

type Actions = {
  [key: String]: Function,
};

type CProps = {
  [key: string]: any,
};

type HydrationParams = {
  WrappedComponent: ComponentType<any>,
  Spinner: ComponentType<any>,
  Error: ComponentType<any>,
  hydrationActions: Actions,
};

const getAction = (name: string, actions: Actions) => {
  const actionNameSplit = name.split('.');
  return actionNameSplit.reduce((acc, curr) => acc[curr], actions);
};

const getParam = (name: string, props: CProps) => {
  const paramNameSplit = name.split('.');
  const paramValue = paramNameSplit.reduce((acc, curr) => acc[curr], props);
  const paramName = paramNameSplit[paramNameSplit.length - 1];
  return {
    [paramName]: paramValue,
  };
};

const getParams = (params: Params, props: CProps) => {
  if (Array.isArray(params)) {
    return params.reduce(
      (acc, curr) => (
        {
          ...acc,
          ...getParam(curr, props),
        }),
      {},
    );
  }
  
  return getParam(params, props);
};

export default function hydrate({
  WrappedComponent,
  Spinner,
  Error,
  hydrationActions,
}: HydrationParams) {
  type Props = {
    loading?: boolean,
    error?: string,
    actions: Actions,
  };
  
  return class extends Component<Props> {
    static defaultProps = {
      loading: false,
      error: '',
    };
    
    hydrationStarted: boolean = false;
    
    componentDidMount() {
      const { actions } = this.props;
      this.hydrationStarted = true;
      hydrationActions.forEach((item) => {
        const actionName = typeof item === 'string' ? item : item.action;
        const action = typeof item === 'string'
          ? getAction(item, actions)
          : getAction(item.action, actions);
        
        const params = typeof item !== 'string' && item.params
          ? getParams(item.params, this.props)
          : {};
        
        if (typeof action === 'function') {
          action(params);
        } else {
          throw new Error(
            `${actionName} is not an action. Check your container mapDispatchToProps configuration.`,
          );
        }
      });
    }
    
    render() {
      const { loading, error, ...rest } = this.props;
      
      return loading || !this.hydrationStarted
        ? <Spinner />
        : (error
          ? <Error error={error} />
          : <WrappedComponent {...rest} />);
    }
  };
}
