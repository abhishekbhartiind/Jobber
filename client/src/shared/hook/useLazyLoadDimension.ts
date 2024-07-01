import { useState, useEffect } from "react";

const useLazyLoadDimensions = (offsetProp: number) => {
    const [height, setHeight] = useState(window.innerHeight);
    const [offset, setOffset] = useState(offsetProp); // Sesuaikan offset sesuai kebutuhan

    useEffect(() => {
        const handleResize = () => {
            setHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return { height, offset };
};

export default useLazyLoadDimensions;
