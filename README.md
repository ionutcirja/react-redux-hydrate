# React-Redux Hydrate
This is an higher-order component to deal with data loading before rendering a component.
Any pull request for optimisations and new additions is more than welcome.

# Installing react-redux-hydrate

```
npm install react-redux-hydrate
```

# Usage

### Create a generic error component

```js
type Props = {
    error: string,
};

const Error = ({ error }: Props) => (
    <p>{error}</p>
);
```

### Create a generic loader component

```js
const LoadingIndicator = () => (
    <span>loading...</span>
);
```

```js
import hydrate from 'react-redux-hydrate';

type Props = {
    someProp: string,
    anotherProp: {
        value: string,
    },
    someOtherProp: string,
    actions: {
        requestData: Function,
        actionsGroup: {
            requestData: Function,
        },
        anotherActionsGroup: {
            requestData: Function,
        },
    },
};

const Component = () => (
    <div>
        // render the necessary things here
    </div>
);

export default hydrate({
    WrappedComponent: Component,
    LoadingIndicator,
    Error,
    hydrationActions: [
        'requestData', // make sure all the necessary actions are passed as props to the component
        {
            action: 'actionsGroup.requestData', // action prop
            params: 'someProp', // make sure all the necessary params are passed as props to the component
        },
        {
            action: 'anotherActionsGroup.requestData', // action prop
            params: ['anotherProp.value', 'someOtherProp'], // list of params
        },
    ]
});
```
