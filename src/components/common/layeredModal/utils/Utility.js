export const createTempDiv = () => {
    const tempDiv = document.createElement('div');
    tempDiv.style.width = 'fit-content';
    tempDiv.style.height = 'fit-content';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'fixed';
    tempDiv.style.overflow = 'auto';
    return tempDiv;
};


export const calculatePosition = (buttonRect, modal, customPosition) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top, left;

    const positions = {
        'top-left': () => {
            top = buttonRect.top - modal.height;
            left = buttonRect.right - modal.width;
        },
        'middle-left': () => {
            top = buttonRect.top + (buttonRect.height / 2) - (modal.height / 2);
            left = buttonRect.left - modal.width;
        },
        'bottom-left': () => {
            top = buttonRect.bottom;
            left = buttonRect.right - modal.width;
        },
        'bottom-center': () => {
            top = buttonRect.bottom;
            left = buttonRect.left + (buttonRect.width / 2) - (modal.width / 2);
        },
        'top-center': () => {
            top = buttonRect.top - modal.height;
            left = buttonRect.left + (buttonRect.width / 2) - (modal.width / 2);
        },
        'right-bottom': () => {
            top = buttonRect.bottom;
            left = buttonRect.left;
        },
        'middle-right': () => {
            top = buttonRect.top + (buttonRect.height / 2) - (modal.height / 2);
            left = buttonRect.right;
        },
        'top-right': () => {
            top = buttonRect.top - modal.height;
            left = buttonRect.left;
        },
        'center': () => {
            top = (viewportHeight - modal.height) / 2;
            left = (viewportWidth - modal.width) / 2;
        }
    };

    // Apply the custom position if provided and it fits within the viewport
    if (customPosition && positions[customPosition]) {
        positions[customPosition]();
        if (
            top >= 0 &&
            left >= 0 &&
            top + modal.height <= viewportHeight &&
            left + modal.width <= viewportWidth
        ) {
            return { top, left };
        }
    }

    // Fallback to default positioning
    // Check if modal can be placed at bottom right of button
    if (buttonRect.bottom + modal.height <= viewportHeight && buttonRect.right + modal.width <= viewportWidth) {
        top = buttonRect.bottom;
        left = buttonRect.left;
        return { top, left };
    }
    // Check if modal can be placed at top right of button
    if (buttonRect.top - modal.height >= 0 && buttonRect.right + modal.width <= viewportWidth) {
        top = buttonRect.top - modal.height;
        left = buttonRect.left;
        return { top, left };
    }
    // Check if modal can be placed at left top of button
    if (buttonRect.top - modal.height >= 0 && buttonRect.left - modal.width >= 0) {
        top = buttonRect.top - modal.height;
        left = buttonRect.right - modal.width;
        return { top, left };
    }
    // Check if modal can be placed at left bottom of button
    if (buttonRect.bottom + modal.height <= viewportHeight && buttonRect.left - modal.width >= 0) {
        top = buttonRect.bottom;
        left = buttonRect.right - modal.width;
        return { top, left };
    }
    // If none of the above positions are suitable, center the modal in the viewport
    top = (viewportHeight - modal.height) / 2;
    left = (viewportWidth - modal.width) / 2;

    return { top, left };
};
