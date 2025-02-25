function debounce(func, wait) {
    let timerId;

    return function debouncedFunction(...args) {
        clearTimeout(timerId);

        timerId = setTimeout(() => {
            func(...args);
        }, wait);
    }
}

export default debounce;