// @flow
import React, { Component } from 'react';
import type { ComponentType } from 'react';

type Params = string | Array<string>;

type Actions = {
  [key: string]: Function,
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

const extractAction = (name: string, actions: Actions) => {
  const actionNameSplit = name.split('.');
  return actionNameSplit.reduce(
    (acc: Actions, curr: string) => acc[curr],
    actions,
  );
};

const extractParam = (name: string, props: CProps) => {
  const paramNameSplit = name.split('.');
  const paramValue = paramNameSplit.reduce(
    (acc: CProps, curr: string) => acc[curr],
    props,
  );
  const paramName = paramNameSplit[paramNameSplit.length - 1];
  return {
    [paramName]: paramValue,
  };
};

const extractParams = (params: Params, props: CProps) => {
  if (Array.isArray(params)) {
    return params.reduce(
      (acc: CProps, curr: string) => (
        {
          ...acc,
          ...extractParam(curr, props),
        }),
      {},
    );
  }
  
  return extractParam(params, props);
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
  
  type State = {
    actionCallError: string,
  };
  
  return class extends Component<Props, State> {
    static defaultProps = {
      loading: false,
      error: '',
    };
    
    state = {
      actionCallError: '',
    };
    
    hydrationStarted: boolean = false;
    
    componentDidMount() {
      const { actions } = this.props;
      this.hydrationStarted = true;
      hydrationActions.forEach((item) => {
        const actionName = typeof item === 'string' ? item : item.action;
        const action = typeof item === 'string'
          ? extractAction(item, actions)
          : extractAction(item.action, actions);
        
        const params = typeof item !== 'string' && item.params
          ? extractParams(item.params, this.props)
          : {};
        
        if (typeof action === 'function') {
          action(params);
        } else {
          this.setState(() => ({
            actionCallError: `${actionName} is not an action. Check your container mapDispatchToProps configuration.`,
          }));
        }
      });
    }
    
    render() {
      const { actionCallError } = this.state;
      const { loading, error, ...rest } = this.props;
      
      if (actionCallError) {
        return <p>{actionCallError}</p>;
      }
      
      return loading || !this.hydrationStarted
        ? <Spinner />
        : (error
          ? <Error error={error} />
          : <WrappedComponent {...rest} />);
    }
  };
}
