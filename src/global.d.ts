/// <reference types="react" />

// Ensure JSX namespace is properly recognized
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {}; // Specify the property name to use
    }
    interface ElementChildrenAttribute {
      children: {}; // Specify the property name to use
    }
    // We can leave IntrinsicElements empty if we are not adding custom HTML tags through JSX
    interface IntrinsicElements {}
  }
}

export {}; // This makes the file a module, which can be important. 