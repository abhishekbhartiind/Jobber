import React from "react";

const useDetectOutsideClick = (
    ref: React.MutableRefObject<HTMLDivElement | null>,
    initialState: boolean
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
    const [isActive, setIsActive] = React.useState<boolean>(initialState);

    const handleClick = React.useCallback(
        (event: MouseEvent): void => {
            if (
                ref.current !== null &&
                !ref.current.contains(event.target as HTMLDivElement)
            ) {
                setIsActive(!isActive);
            }
        },
        [isActive, ref]
    );

    React.useEffect(() => {
        if (isActive) {
            window.addEventListener("click", handleClick);
        }

        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, [isActive, handleClick]);

    return [isActive, setIsActive];
};

export default useDetectOutsideClick;
