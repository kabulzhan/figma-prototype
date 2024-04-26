import React from "react";

function useWhatChanged(props: { [prop: string]: unknown }) {
  // cache the last set of props
  const prev = React.useRef(props);

  React.useEffect(() => {
    // check each prop to see if it has changed
    const changed = Object.entries(props).reduce(
      (a, [key, prop]: [string, unknown]) => {
        if (prev.current[key] === prop) return a;
        return {
          ...a,
          [key]: {
            prev: prev.current[key],
            next: prop,
          },
        };
      },
      {} as { [k: string]: any },
    );

    if (Object.keys(changed).length > 0) {
      console.group("Props That Changed");
      console.log(changed);
      console.groupEnd();
    }

    prev.current = props;
  }, [props]);
}

export default useWhatChanged;
