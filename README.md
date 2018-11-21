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

const ErrorWrapper = ({ error }: Props) => (
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
import { connect } from 'react-redux';

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

const Component = (props: Props) => (
    <div>
        // render the necessary things here
    </div>
);

const mapStateToProps = (state: State) => ({
    loading: state..., // make sure you will set the loading prop value to true when a request starts and set it to false when it is resolved
    error: state..., // make sure you will set an error prop in the state when a request fails
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    // make sure you will map all the necessary actions here
});

export default connect(mapStateToProps, mapDispatchToProps)(
    hydrate({
        WrappedComponent: Component,
        LoadingIndicator,
        ErrorWrapper,
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
    })
);
```
