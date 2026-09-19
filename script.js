// =====================================================
// BIRTHDAY SKY
// MEMORY-ONLY VERSION
// =====================================================


// =====================================================
// SESSION DATA
// Nothing is saved to localStorage or to the project.
// Refreshing the page clears everything.
// =====================================================

let currentAccount = null;

let accounts = [];

let sessionConstellations = [];

let activeCardData = null;

let editingConstellationId = null;

let waitingForConstellation = false;


// =====================================================
// MAIN ELEMENTS
// =====================================================

const sky =
    document.getElementById("sky");

const space =
    document.getElementById("space");


// =====================================================
// CREATE SKY STARS
// =====================================================

for (let i = 0; i < 600; i++) {

    const star =
        document.createElement("div");

    star.className =
        "star";

    const size =
        Math.random() * 2.5 + 1;

    star.style.width =
        `${size}px`;

    star.style.height =
        `${size}px`;

    star.style.left =
        `${Math.random() * 100}%`;

    star.style.top =
        `${Math.random() * 100}%`;

    star.style.opacity =
        Math.random() * 0.5 + 0.2;


    if (Math.random() < 0.15) {

        star.classList.add(
            "twinkle"
        );

        star.style.animationDelay =
            `${Math.random() * 3}s`;

    }


    if (Math.random() < 0.05) {

        star.classList.add(
            "bright-star"
        );

    }


    space.appendChild(
        star
    );

}


// =====================================================
// SKY MOVEMENT
// =====================================================

let draggingSky = false;

let skyPointerId = null;

let startX = 0;
let startY = 0;

let offsetX = 0;
let offsetY = 0;

let zoom = 1;


function updateSpace() {

    space.style.transform =
        `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;

}


function shouldIgnoreSkyPointer(target) {

    return Boolean(

        target.closest("button") ||

        target.closest("input") ||

        target.closest("textarea") ||

        target.closest("select") ||

        target.closest(".wish-window") ||

        target.closest(".account-window") ||

        target.closest(".constellation-window") ||

        target.closest(".saved-card-window")

    );

}


// =====================================================
// SKY DRAG
// =====================================================

sky.addEventListener(
    "pointerdown",
    function(event) {

        if (
            shouldIgnoreSkyPointer(
                event.target
            )
        ) {

            return;

        }


        if (
            skyPointerId !== null
        ) {

            return;

        }


        skyPointerId =
            event.pointerId;

        draggingSky =
            true;

        startX =
            event.clientX -
            offsetX;

        startY =
            event.clientY -
            offsetY;

        sky.setPointerCapture(
            event.pointerId
        );

    }
);


sky.addEventListener(
    "pointermove",
    function(event) {

        if (
            !draggingSky ||
            event.pointerId !==
            skyPointerId
        ) {

            return;

        }


        offsetX =
            event.clientX -
            startX;

        offsetY =
            event.clientY -
            startY;

        updateSpace();

    }
);


function stopSkyDrag(event) {

    if (
        event.pointerId !==
        skyPointerId
    ) {

        return;

    }


    draggingSky =
        false;

    skyPointerId =
        null;


    try {

        sky.releasePointerCapture(
            event.pointerId
        );

    } catch (error) {

        // Already released.

    }

}


sky.addEventListener(
    "pointerup",
    stopSkyDrag
);


sky.addEventListener(
    "pointercancel",
    stopSkyDrag
);


// =====================================================
// DESKTOP ZOOM
// =====================================================

sky.addEventListener(
    "wheel",
    function(event) {

        if (
            event.target.closest(".wish-window") ||
            event.target.closest(".account-window") ||
            event.target.closest(".constellation-window") ||
            event.target.closest(".saved-card-window")
        ) {

            return;

        }


        event.preventDefault();


        zoom +=
            event.deltaY < 0
                ? 0.1
                : -0.1;


        zoom =
            Math.max(
                0.5,
                Math.min(
                    2.5,
                    zoom
                )
            );


        updateSpace();

    },
    {
        passive: false
    }
);


// =====================================================
// MOBILE PINCH ZOOM
// =====================================================

let pinchStartDistance = null;

let pinchStartZoom = 1;


function getTouchDistance(event) {

    if (
        event.touches.length < 2
    ) {

        return null;

    }


    const first =
        event.touches[0];

    const second =
        event.touches[1];


    const dx =
        first.clientX -
        second.clientX;

    const dy =
        first.clientY -
        second.clientY;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


sky.addEventListener(
    "touchstart",
    function(event) {

        if (
            event.target.closest(".wish-window") ||
            event.target.closest(".account-window") ||
            event.target.closest(".constellation-window") ||
            event.target.closest(".saved-card-window")
        ) {

            return;

        }


        if (
            event.touches.length === 2
        ) {

            pinchStartDistance =
                getTouchDistance(event);

            pinchStartZoom =
                zoom;

        }

    },
    {
        passive: false
    }
);


sky.addEventListener(
    "touchmove",
    function(event) {

        if (
            event.target.closest(".wish-window") ||
            event.target.closest(".account-window") ||
            event.target.closest(".constellation-window") ||
            event.target.closest(".saved-card-window")
        ) {

            return;

        }


        if (
            event.touches.length !== 2 ||
            pinchStartDistance === null
        ) {

            return;

        }


        event.preventDefault();


        const currentDistance =
            getTouchDistance(event);


        zoom =
            pinchStartZoom *
            (
                currentDistance /
                pinchStartDistance
            );


        zoom =
            Math.max(
                0.5,
                Math.min(
                    2.5,
                    zoom
                )
            );


        updateSpace();

    },
    {
        passive: false
    }
);


sky.addEventListener(
    "touchend",
    function(event) {

        if (
            event.touches.length < 2
        ) {

            pinchStartDistance =
                null;

        }

    }
);


// =====================================================
// SHOOTING STARS
// =====================================================

function createShootingStar() {

    const shootingStar =
        document.createElement(
            "div"
        );


    shootingStar.className =
        "shooting-star";


    shootingStar.style.left =
        `${Math.random() * 100}%`;


    shootingStar.style.top =
        `${Math.random() * 45}%`;


    space.appendChild(
        shootingStar
    );


    setTimeout(
        function() {

            shootingStar.remove();

        },
        1500
    );

}


setInterval(
    createShootingStar,
    8000
);


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    document.getElementById(
        "wishCount"
    ).textContent =
        sessionConstellations.length;


    document.getElementById(
        "constellationCount"
    ).textContent =
        sessionConstellations.length;


    document.getElementById(
        "friendCount"
    ).textContent =
        currentAccount
            ? "1"
            : "0";


    const unopened =
        sessionConstellations.filter(
            function(item) {

                return item.unopened === true;

            }
        ).length;


    document.getElementById(
        "unopenedCount"
    ).textContent =
        unopened;


    const unopenedStat =
        document.getElementById(
            "unopenedStat"
        );


    unopenedStat.classList.toggle(
        "has-unopened",
        unopened > 0
    );

}


updateStatistics();


// =====================================================
// ELEMENT MENU
// =====================================================

const addWish =
    document.getElementById(
        "addWish"
    );


const elementMenu =
    document.getElementById(
        "elementMenu"
    );


const openConstellation =
    document.getElementById(
        "openConstellation"
    );


addWish.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();


        elementMenu.classList.toggle(
            "hidden"
        );

    }
);


document.addEventListener(
    "pointerdown",
    function(event) {

        if (
            elementMenu.classList.contains(
                "hidden"
            )
        ) {

            return;

        }


        if (
            event.target.closest(
                "#elementMenu"
            ) ||
            event.target.closest(
                "#addWish"
            )
        ) {

            return;

        }


        elementMenu.classList.add(
            "hidden"
        );

    }
);


// =====================================================
// WISH STUDIO ELEMENTS
// =====================================================

const wishStudio =
    document.getElementById(
        "wishStudio"
    );


const closeWishStudio =
    document.getElementById(
        "closeWishStudio"
    );


const resetCard =
    document.getElementById(
        "resetCard"
    );


openConstellation.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();


        elementMenu.classList.add(
            "hidden"
        );


        editingConstellationId =
            null;


        openWishStudio();

    }
);


function openWishStudio() {

    wishStudio.classList.remove(
        "hidden"
    );

}


closeWishStudio.addEventListener(
    "click",
    function() {

        wishStudio.classList.add(
            "hidden"
        );


        deselectSticker();
        deselectText();

    }
);


// =====================================================
// RESET CARD
// =====================================================

resetCard.addEventListener(
    "click",
    function() {

        const confirmed =
            confirm(
                "Start this card over?"
            );


        if (!confirmed) {

            return;

        }


        resetCardCreator();

    }
);


function resetCardCreator() {

    wishTitle.value =
        "";

    wishBody.value =
        "";

    wishFrom.value =
        "";


    previewTitle.textContent =
        "Happy Birthday! ✨";

    previewBody.textContent =
        "Your beautiful birthday message will appear here...";

    previewFrom.textContent =
        "— Your bestie ♡";


    updateBodyPlaceholder();


    titleFont.value =
        "elegant";

    bodyFont.value =
        "elegant";

    fromFont.value =
        "handwritten";


    applyFont(
        previewTitle,
        "elegant"
    );

    applyFont(
        previewBody,
        "elegant"
    );

    applyFont(
        previewFrom,
        "handwritten"
    );


    titleSize.value =
        32;

    bodySize.value =
        18;

    fromSize.value =
        17;


    previewTitle.style.fontSize =
        "32px";

    previewBody.style.fontSize =
        "18px";

    previewFrom.style.fontSize =
        "17px";


    resetFormatting();


    selectedTheme =
        "midnight";

    updateThemeButtons();
    updateTheme();


    selectedBackground =
        "plain";

    updateBackgroundButtons();
    updateBackground();


    selectedBorder =
        "none";

    updateBorderButtons();
    updateBorder();


    setAccentColor(
        "#B89CFF"
    );


    customColor.value =
        "#B89CFF";


    wishPreview
        .querySelectorAll(
            ".card-sticker"
        )
        .forEach(
            function(sticker) {

                sticker.remove();

            }
        );


    stickerCounter =
        0;


    stickerTabs.forEach(
        function(tab) {

            tab.classList.remove(
                "active"
            );

        }
    );


    document
        .querySelector(
            '.sticker-tab[data-category="all"]'
        )
        .classList.add(
            "active"
        );


    showStickerCategory(
        "all"
    );


    setInitialTextPosition(
        previewTitle,
        "title"
    );


    setInitialTextPosition(
        previewBody,
        "body"
    );


    setInitialTextPosition(
        previewFrom,
        "from"
    );


    deselectSticker();
    deselectText();

}


// =====================================================
// CARD TEXT
// =====================================================

const wishTitle =
    document.getElementById(
        "wishTitle"
    );


const wishBody =
    document.getElementById(
        "wishBody"
    );


const wishFrom =
    document.getElementById(
        "wishFrom"
    );


const previewTitle =
    document.getElementById(
        "previewTitle"
    );


const previewBody =
    document.getElementById(
        "previewBody"
    );


const previewFrom =
    document.getElementById(
        "previewFrom"
    );


const wishPreview =
    document.getElementById(
        "wishPreview"
    );


const titleFont =
    document.getElementById(
        "titleFont"
    );


const bodyFont =
    document.getElementById(
        "bodyFont"
    );


const fromFont =
    document.getElementById(
        "fromFont"
    );


const titleSize =
    document.getElementById(
        "titleSize"
    );


const bodySize =
    document.getElementById(
        "bodySize"
    );


const fromSize =
    document.getElementById(
        "fromSize"
    );


wishTitle.addEventListener(
    "input",
    function() {

        previewTitle.textContent =
            wishTitle.value.trim() ||
            "Happy Birthday! ✨";

    }
);


wishBody.addEventListener(
    "input",
    function() {

        previewBody.textContent =
            wishBody.value.trim() ||
            "Your beautiful birthday message will appear here...";


        updateBodyPlaceholder();

    }
);


wishFrom.addEventListener(
    "input",
    function() {

        previewFrom.textContent =
            wishFrom.value.trim() ||
            "— Your bestie ♡";

    }
);


function updateBodyPlaceholder() {

    previewBody.classList.toggle(
        "placeholder-message",
        wishBody.value.trim() === ""
    );

}


updateBodyPlaceholder();


// =====================================================
// FONTS
// =====================================================

const fontClasses = [

    "font-elegant",

    "font-typewriter",

    "font-handwritten",

    "font-dancing",

    "font-caveat",

    "font-abril",

    "font-pristina"

];


function applyFont(
    element,
    fontName
) {

    fontClasses.forEach(
        function(className) {

            element.classList.remove(
                className
            );

        }
    );


    element.classList.add(
        `font-${fontName}`
    );

}


titleFont.addEventListener(
    "change",
    function() {

        applyFont(
            previewTitle,
            titleFont.value
        );

    }
);


bodyFont.addEventListener(
    "change",
    function() {

        applyFont(
            previewBody,
            bodyFont.value
        );

    }
);


fromFont.addEventListener(
    "change",
    function() {

        applyFont(
            previewFrom,
            fromFont.value
        );

    }
);


// =====================================================
// FONT SIZES
// =====================================================

titleSize.addEventListener(
    "input",
    function() {

        previewTitle.style.fontSize =
            `${titleSize.value}px`;


        syncSelectedTextSize(
            previewTitle
        );

    }
);


bodySize.addEventListener(
    "input",
    function() {

        previewBody.style.fontSize =
            `${bodySize.value}px`;


        syncSelectedTextSize(
            previewBody
        );

    }
);


fromSize.addEventListener(
    "input",
    function() {

        previewFrom.style.fontSize =
            `${fromSize.value}px`;


        syncSelectedTextSize(
            previewFrom
        );

    }
);


// =====================================================
// FORMATTING
// =====================================================

const formattingControls = {

    title: {

        element:
            previewTitle,

        bold:
            document.getElementById(
                "titleBold"
            ),

        italic:
            document.getElementById(
                "titleItalic"
            ),

        underline:
            document.getElementById(
                "titleUnderline"
            ),

        color:
            document.getElementById(
                "titleColor"
            )

    },


    body: {

        element:
            previewBody,

        bold:
            document.getElementById(
                "bodyBold"
            ),

        italic:
            document.getElementById(
                "bodyItalic"
            ),

        underline:
            document.getElementById(
                "bodyUnderline"
            ),

        color:
            document.getElementById(
                "bodyColor"
            )

    },


    from: {

        element:
            previewFrom,

        bold:
            document.getElementById(
                "fromBold"
            ),

        italic:
            document.getElementById(
                "fromItalic"
            ),

        underline:
            document.getElementById(
                "fromUnderline"
            ),

        color:
            document.getElementById(
                "fromColor"
            )

    }

};


function toggleFormat(
    element,
    property,
    button
) {

    if (
        property ===
        "fontWeight"
    ) {

        const active =
            element.style.fontWeight ===
            "700";


        element.style.fontWeight =
            active
                ? "400"
                : "700";


        button.classList.toggle(
            "active",
            !active
        );

    }


    if (
        property ===
        "fontStyle"
    ) {

        const active =
            element.style.fontStyle ===
            "italic";


        element.style.fontStyle =
            active
                ? "normal"
                : "italic";


        button.classList.toggle(
            "active",
            !active
        );

    }


    if (
        property ===
        "textDecoration"
    ) {

        const active =
            element.style.textDecoration ===
            "underline";


        element.style.textDecoration =
            active
                ? "none"
                : "underline";


        button.classList.toggle(
            "active",
            !active
        );

    }

}


function resetFormatting() {

    Object.values(
        formattingControls
    ).forEach(
        function(control) {

            control.element.style.fontWeight =
                "400";

            control.element.style.fontStyle =
                "normal";

            control.element.style.textDecoration =
                "none";

            control.element.style.color =
                "";

            control.bold.classList.remove(
                "active"
            );

            control.italic.classList.remove(
                "active"
            );

            control.underline.classList.remove(
                "active"
            );

        }
    );

}


Object.values(
    formattingControls
).forEach(
    function(control) {

        control.bold.addEventListener(
            "click",
            function() {

                toggleFormat(
                    control.element,
                    "fontWeight",
                    control.bold
                );

            }
        );


        control.italic.addEventListener(
            "click",
            function() {

                toggleFormat(
                    control.element,
                    "fontStyle",
                    control.italic
                );

            }
        );


        control.underline.addEventListener(
            "click",
            function() {

                toggleFormat(
                    control.element,
                    "textDecoration",
                    control.underline
                );

            }
        );


        control.color.addEventListener(
            "input",
            function() {

                control.element.style.color =
                    control.color.value;


                const circle =
                    control.color
                        .parentElement
                        .querySelector(
                            "span"
                        );


                if (circle) {

                    circle.style.background =
                        control.color.value;

                }

            }
        );

    }
);


// =====================================================
// THEMES
// =====================================================

const themeButtons =
    document.querySelectorAll(
        ".theme-option"
    );


let selectedTheme =
    "midnight";


function updateTheme() {

    wishPreview.classList.remove(

        "theme-midnight",
        "theme-blossom",
        "theme-ocean",
        "theme-sunset",
        "theme-cosmic",
        "theme-candy"

    );


    wishPreview.classList.add(
        `theme-${selectedTheme}`
    );

}


function updateThemeButtons() {

    themeButtons.forEach(
        function(button) {

            button.classList.toggle(
                "active",
                button.dataset.theme ===
                selectedTheme
            );

        }
    );

}


themeButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                selectedTheme =
                    button.dataset.theme;

                updateThemeButtons();
                updateTheme();

            }
        );

    }
);


// =====================================================
// BACKGROUNDS
// =====================================================

const backgroundButtons =
    document.querySelectorAll(
        ".background-option"
    );


let selectedBackground =
    "plain";


function updateBackground() {

    wishPreview.classList.remove(

        "background-plain",
        "background-notebook",
        "background-stardust",
        "background-scrapbook"

    );


    wishPreview.classList.add(
        `background-${selectedBackground}`
    );

}


function updateBackgroundButtons() {

    backgroundButtons.forEach(
        function(button) {

            button.classList.toggle(
                "active",
                button.dataset.background ===
                selectedBackground
            );

        }
    );

}


backgroundButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                selectedBackground =
                    button.dataset.background;

                updateBackgroundButtons();
                updateBackground();

            }
        );

    }
);


// =====================================================
// BORDERS
// =====================================================

const borderButtons =
    document.querySelectorAll(
        ".border-option"
    );


const cardFrame =
    document.getElementById(
        "cardFrame"
    );


let selectedBorder =
    "none";


function updateBorder() {

    cardFrame.className =
        "card-frame";


    cardFrame.classList.add(
        `border-${selectedBorder}`
    );

}


function updateBorderButtons() {

    borderButtons.forEach(
        function(button) {

            button.classList.toggle(
                "active",
                button.dataset.border ===
                selectedBorder
            );

        }
    );

}


borderButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                selectedBorder =
                    button.dataset.border;

                updateBorderButtons();
                updateBorder();

            }
        );

    }
);


// =====================================================
// ACCENT
// =====================================================

const colorSwatches =
    document.querySelectorAll(
        ".color-swatch"
    );


const customColor =
    document.getElementById(
        "customColor"
    );


function setAccentColor(
    color
) {

    wishPreview.style.setProperty(
        "--accent",
        color
    );


    colorSwatches.forEach(
        function(swatch) {

            swatch.classList.remove(
                "active"
            );

        }
    );


    const circle =
        document.querySelector(
            ".custom-color span"
        );


    if (circle) {

        circle.style.background =
            color;

    }

}


colorSwatches.forEach(
    function(swatch) {

        swatch.addEventListener(
            "click",
            function() {

                const color =
                    swatch.dataset.color;


                setAccentColor(
                    color
                );


                swatch.classList.add(
                    "active"
                );


                customColor.value =
                    color;

            }
        );

    }
);


customColor.addEventListener(
    "input",
    function() {

        setAccentColor(
            customColor.value
        );

    }
);


// =====================================================
// STICKERS
// =====================================================

const stickerTabs =
    document.querySelectorAll(
        ".sticker-tab"
    );


const stickerButtons =
    document.querySelectorAll(
        ".sticker-button"
    );


const myStickersContainer =
    document.getElementById(
        "myStickersContainer"
    );


function showStickerCategory(
    category
) {

    stickerButtons.forEach(
        function(button) {

            button.style.display =
                (
                    category === "all" ||
                    button.dataset.category === category
                )
                    ? "block"
                    : "none";

        }
    );


    myStickersContainer.style.display =
        category === "my-stickers"
            ? "block"
            : "none";

}


stickerTabs.forEach(
    function(tab) {

        tab.addEventListener(
            "click",
            function() {

                stickerTabs.forEach(
                    function(other) {

                        other.classList.remove(
                            "active"
                        );

                    }
                );


                tab.classList.add(
                    "active"
                );


                showStickerCategory(
                    tab.dataset.category
                );

            }
        );

    }
);


showStickerCategory(
    "all"
);


let selectedSticker =
    null;


let stickerCounter =
    0;


const stickerToolbar =
    document.getElementById(
        "stickerToolbar"
    );


function addCardSticker(
    content,
    size,
    x = null,
    y = null,
    rotation = 0
) {

    const sticker =
        document.createElement(
            "div"
        );


    sticker.className =
        "card-sticker";


    sticker.textContent =
        content;


    sticker.dataset.size =
        size;


    sticker.dataset.rotation =
        rotation;


    sticker.style.fontSize =
        `${size}px`;


    sticker.style.transform =
        `translate(-50%,-50%) rotate(${rotation}deg)`;


    if (
        x === null ||
        y === null
    ) {

        x =
            wishPreview.clientWidth *
            (
                0.18 +
                Math.random() * 0.64
            );


        y =
            wishPreview.clientHeight *
            (
                0.18 +
                Math.random() * 0.64
            );

    }


    sticker.style.left =
        `${x}px`;


    sticker.style.top =
        `${y}px`;


    wishPreview.appendChild(
        sticker
    );


    makeStickerDraggable(
        sticker
    );


    selectSticker(
        sticker
    );

}


stickerButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                addCardSticker(

                    button.dataset.sticker,

                    button.dataset.big === "true"
                        ? 105
                        : 38

                );

            }
        );

    }
);


// =====================================================
// STICKER DRAGGING
// =====================================================

function makeStickerDraggable(
    sticker
) {

    let dragging = false;

    let offsetX = 0;
    let offsetY = 0;


    sticker.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();
            event.stopPropagation();


            selectSticker(
                sticker
            );


            dragging = true;


            sticker.setPointerCapture(
                event.pointerId
            );


            const rect =
                sticker.getBoundingClientRect();


            offsetX =
                event.clientX -
                (
                    rect.left +
                    rect.width / 2
                );


            offsetY =
                event.clientY -
                (
                    rect.top +
                    rect.height / 2
                );

        }
    );


    sticker.addEventListener(
        "pointermove",
        function(event) {

            if (!dragging) {
                return;
            }


            const rect =
                wishPreview.getBoundingClientRect();


            const size =
                parseFloat(
                    sticker.dataset.size
                );


            let x =
                event.clientX -
                rect.left -
                offsetX;


            let y =
                event.clientY -
                rect.top -
                offsetY;


            const padding =
                size / 2;


            x =
                Math.max(
                    padding,
                    Math.min(
                        rect.width -
                        padding,
                        x
                    )
                );


            y =
                Math.max(
                    padding,
                    Math.min(
                        rect.height -
                        padding,
                        y
                    )
                );


            sticker.style.left =
                `${x}px`;


            sticker.style.top =
                `${y}px`;

        }
    );


    sticker.addEventListener(
        "pointerup",
        function() {

            dragging = false;

        }
    );


    sticker.addEventListener(
        "pointercancel",
        function() {

            dragging = false;

        }
    );

}


function selectSticker(
    sticker
) {

    deselectText();


    if (selectedSticker) {

        selectedSticker.classList.remove(
            "selected"
        );

    }


    selectedSticker =
        sticker;


    sticker.classList.add(
        "selected"
    );


    stickerToolbar.classList.remove(
        "hidden"
    );

}


function deselectSticker() {

    if (selectedSticker) {

        selectedSticker.classList.remove(
            "selected"
        );

    }


    selectedSticker =
        null;


    stickerToolbar.classList.add(
        "hidden"
    );

}


// =====================================================
// STICKER CONTROLS
// =====================================================

function resizeSelectedSticker(
    amount
) {

    if (!selectedSticker) {
        return;
    }


    let size =
        parseFloat(
            selectedSticker.dataset.size
        );


    size +=
        amount;


    size =
        Math.max(
            18,
            Math.min(
                220,
                size
            )
        );


    selectedSticker.dataset.size =
        size;


    if (
        selectedSticker.tagName ===
        "IMG"
    ) {

        selectedSticker.style.width =
            `${size}px`;

        selectedSticker.style.height =
            `${size}px`;

    } else {

        selectedSticker.style.fontSize =
            `${size}px`;

    }

}


document.getElementById(
    "makeSmaller"
).addEventListener(
    "click",
    function() {

        resizeSelectedSticker(
            -8
        );

    }
);


document.getElementById(
    "makeLarger"
).addEventListener(
    "click",
    function() {

        resizeSelectedSticker(
            8
        );

    }
);


function rotateSelectedSticker(
    amount
) {

    if (!selectedSticker) {
        return;
    }


    let rotation =
        parseFloat(
            selectedSticker.dataset.rotation
        );


    rotation +=
        amount;


    selectedSticker.dataset.rotation =
        rotation;


    selectedSticker.style.transform =
        `translate(-50%,-50%) rotate(${rotation}deg)`;

}


document.getElementById(
    "rotateLeft"
).addEventListener(
    "click",
    function() {

        rotateSelectedSticker(
            -15
        );

    }
);


document.getElementById(
    "rotateRight"
).addEventListener(
    "click",
    function() {

        rotateSelectedSticker(
            15
        );

    }
);


document.getElementById(
    "deleteSticker"
).addEventListener(
    "click",
    function() {

        if (!selectedSticker) {
            return;
        }


        selectedSticker.remove();

        deselectSticker();

    }
);


// =====================================================
// DUPLICATE STICKER
// =====================================================

document.getElementById(
    "duplicateSticker"
).addEventListener(
    "click",
    function() {

        if (!selectedSticker) {
            return;
        }


        const old =
            selectedSticker;


        const x =
            parseFloat(
                old.style.left
            );


        const y =
            parseFloat(
                old.style.top
            );


        const size =
            parseFloat(
                old.dataset.size
            );


        const rotation =
            parseFloat(
                old.dataset.rotation
            );


        if (
            old.tagName === "IMG"
        ) {

            const duplicate =
                old.cloneNode(true);


            duplicate.dataset.size =
                size;


            duplicate.dataset.rotation =
                rotation;


            duplicate.style.left =
                `${x + 35}px`;


            duplicate.style.top =
                `${y + 35}px`;


            wishPreview.appendChild(
                duplicate
            );


            makeStickerDraggable(
                duplicate
            );


            selectSticker(
                duplicate
            );


            return;

        }


        addCardSticker(
            old.textContent,
            size,
            x + 35,
            y + 35,
            rotation
        );

    }
);


// =====================================================
// LAYERS
// =====================================================

function changeStickerLayer(
    amount
) {

    if (!selectedSticker) {
        return;
    }


    let z =
        parseInt(
            selectedSticker.style.zIndex ||
            "20"
        );


    z +=
        amount;


    selectedSticker.style.zIndex =
        Math.max(
            5,
            Math.min(
                100,
                z
            )
        );

}


document.getElementById(
    "bringForward"
).addEventListener(
    "click",
    function() {

        changeStickerLayer(
            1
        );

    }
);


document.getElementById(
    "sendBackward"
).addEventListener(
    "click",
    function() {

        changeStickerLayer(
            -1
        );

    }
);


// =====================================================
// MY STICKER UPLOAD
// =====================================================

const uploadButton =
    document.getElementById(
        "uploadStickerButton"
    );


const uploadInput =
    document.getElementById(
        "stickerUpload"
    );


uploadButton.addEventListener(
    "click",
    function() {

        uploadInput.click();

    }
);


uploadInput.addEventListener(
    "change",
    function() {

        const file =
            uploadInput.files[0];


        if (!file) {
            return;
        }


        if (
            ![
                "image/png",
                "image/jpeg",
                "image/webp"
            ].includes(
                file.type
            )
        ) {

            alert(
                "Please choose a PNG, JPG or WebP image."
            );


            uploadInput.value =
                "";


            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.className =
                    "card-sticker";


                image.src =
                    event.target.result;


                image.dataset.size =
                    100;


                image.dataset.rotation =
                    0;


                image.style.width =
                    "100px";


                image.style.height =
                    "100px";


                image.style.objectFit =
                    "contain";


                image.style.left =
                    `${wishPreview.clientWidth / 2}px`;


                image.style.top =
                    `${wishPreview.clientHeight / 2}px`;


                image.style.transform =
                    "translate(-50%,-50%)";


                wishPreview.appendChild(
                    image
                );


                makeStickerDraggable(
                    image
                );


                selectSticker(
                    image
                );

            };


        reader.readAsDataURL(
            file
        );


        uploadInput.value =
            "";

    }
);


// =====================================================
// TEXT DRAGGING
// =====================================================

const draggableTextElements =
    document.querySelectorAll(
        ".draggable-text"
    );


const textControlPanel =
    document.getElementById(
        "textControlPanel"
    );


const selectedTextLabel =
    document.getElementById(
        "selectedTextLabel"
    );


const textSizeDown =
    document.getElementById(
        "textSizeDown"
    );


const textSizeUp =
    document.getElementById(
        "textSizeUp"
    );


const textSizeSlider =
    document.getElementById(
        "textSizeSlider"
    );


let selectedText =
    null;


let textDragData =
    null;


function setInitialTextPosition(
    element,
    type
) {

    if (
        type === "title"
    ) {

        element.dataset.x =
            "50";

        element.dataset.y =
            "34";

    }


    if (
        type === "body"
    ) {

        element.dataset.x =
            "50";

        element.dataset.y =
            "57";

    }


    if (
        type === "from"
    ) {

        element.dataset.x =
            "76";

        element.dataset.y =
            "84";

    }


    element.style.left =
        `${element.dataset.x}%`;


    element.style.top =
        `${element.dataset.y}%`;


    element.style.transform =
        "translate(-50%,-50%)";

}


draggableTextElements.forEach(
    function(element) {

        setInitialTextPosition(
            element,
            element.dataset.textType
        );

    }
);


// =====================================================
// SELECT TEXT
// =====================================================

function selectText(
    element
) {

    deselectSticker();


    if (selectedText) {

        selectedText.classList.remove(
            "text-selected"
        );

    }


    selectedText =
        element;


    selectedText.classList.add(
        "text-selected"
    );


    textControlPanel.classList.remove(
        "hidden"
    );


    if (
        element.dataset.textType ===
        "title"
    ) {

        selectedTextLabel.textContent =
            "Greeting";

    }


    if (
        element.dataset.textType ===
        "body"
    ) {

        selectedTextLabel.textContent =
            "Message";

    }


    if (
        element.dataset.textType ===
        "from"
    ) {

        selectedTextLabel.textContent =
            "Signature";

    }


    updateTextControlSlider();

}


function deselectText() {

    if (selectedText) {

        selectedText.classList.remove(
            "text-selected"
        );

    }


    selectedText =
        null;


    textControlPanel.classList.add(
        "hidden"
    );

}


function getTextSize(
    element
) {

    return parseFloat(
        window.getComputedStyle(
            element
        ).fontSize
    );

}


function updateTextControlSlider() {

    if (!selectedText) {
        return;
    }


    textSizeSlider.value =
        Math.round(
            Math.max(
                12,
                Math.min(
                    50,
                    getTextSize(
                        selectedText
                    )
                )
            )
        );

}


function updateLeftSizeControl(
    element,
    size
) {

    if (
        element ===
        previewTitle
    ) {

        titleSize.value =
            size;

    }


    if (
        element ===
        previewBody
    ) {

        bodySize.value =
            size;

    }


    if (
        element ===
        previewFrom
    ) {

        fromSize.value =
            size;

    }

}


function syncSelectedTextSize(
    element
) {

    if (
        selectedText ===
        element
    ) {

        updateTextControlSlider();

    }

}


function setSelectedTextSize(
    value
) {

    if (!selectedText) {
        return;
    }


    const size =
        Math.max(
            12,
            Math.min(
                50,
                Number(value)
            )
        );


    selectedText.style.fontSize =
        `${size}px`;


    updateLeftSizeControl(
        selectedText,
        size
    );


    updateTextControlSlider();

}


textSizeDown.addEventListener(
    "click",
    function() {

        if (!selectedText) {
            return;
        }


        setSelectedTextSize(
            getTextSize(
                selectedText
            ) - 2
        );

    }
);


textSizeUp.addEventListener(
    "click",
    function() {

        if (!selectedText) {
            return;
        }


        setSelectedTextSize(
            getTextSize(
                selectedText
            ) + 2
        );

    }
);


textSizeSlider.addEventListener(
    "input",
    function() {

        setSelectedTextSize(
            textSizeSlider.value
        );

    }
);


// =====================================================
// TEXT POINTER DRAG
// =====================================================

draggableTextElements.forEach(
    function(element) {

        element.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();
                event.stopPropagation();


                selectText(
                    element
                );


                const rect =
                    wishPreview.getBoundingClientRect();


                textDragData = {

                    element:
                        element,

                    pointerId:
                        event.pointerId,

                    startPointerX:
                        event.clientX,

                    startPointerY:
                        event.clientY,

                    startPercentX:
                        parseFloat(
                            element.dataset.x
                        ),

                    startPercentY:
                        parseFloat(
                            element.dataset.y
                        ),

                    previewWidth:
                        rect.width,

                    previewHeight:
                        rect.height

                };


                element.setPointerCapture(
                    event.pointerId
                );

            }
        );


        element.addEventListener(
            "pointermove",
            function(event) {

                if (
                    !textDragData ||
                    textDragData.element !==
                    element ||
                    textDragData.pointerId !==
                    event.pointerId
                ) {

                    return;

                }


                const dx =
                    event.clientX -
                    textDragData.startPointerX;


                const dy =
                    event.clientY -
                    textDragData.startPointerY;


                const x =
                    textDragData.startPercentX +
                    dx /
                    textDragData.previewWidth *
                    100;


                const y =
                    textDragData.startPercentY +
                    dy /
                    textDragData.previewHeight *
                    100;


                const clampedX =
                    Math.max(
                        6,
                        Math.min(
                            94,
                            x
                        )
                    );


                const clampedY =
                    Math.max(
                        7,
                        Math.min(
                            93,
                            y
                        )
                    );


                element.dataset.x =
                    clampedX;


                element.dataset.y =
                    clampedY;


                element.style.left =
                    `${clampedX}%`;


                element.style.top =
                    `${clampedY}%`;

            }
        );


        element.addEventListener(
            "pointerup",
            function() {

                textDragData =
                    null;

            }
        );


        element.addEventListener(
            "pointercancel",
            function() {

                textDragData =
                    null;

            }
        );

    }
);


wishPreview.addEventListener(
    "pointerdown",
    function(event) {

        if (
            event.target.closest(
                ".draggable-text"
            ) ||
            event.target.closest(
                ".card-sticker"
            ) ||
            event.target.closest(
                ".text-control-panel"
            )
        ) {

            return;

        }


        deselectText();
        deselectSticker();

    }
);


// =====================================================
// CAPTURE CARD
// =====================================================

function captureCardData() {

    const stickers = [];


    wishPreview
        .querySelectorAll(
            ".card-sticker"
        )
        .forEach(
            function(sticker) {

                stickers.push({

                    type:
                        sticker.tagName ===
                        "IMG"
                            ? "image"
                            : "emoji",

                    content:
                        sticker.tagName ===
                        "IMG"
                            ? sticker.src
                            : sticker.textContent,

                    size:
                        parseFloat(
                            sticker.dataset.size
                        ),

                    x:
                        parseFloat(
                            sticker.style.left
                        ),

                    y:
                        parseFloat(
                            sticker.style.top
                        ),

                    rotation:
                        parseFloat(
                            sticker.dataset.rotation
                        )

                });

            }
        );


    return {

        title:
            wishTitle.value.trim(),

        body:
            wishBody.value.trim(),

        from:
            wishFrom.value.trim(),


        theme:
            selectedTheme,

        background:
            selectedBackground,

        border:
            selectedBorder,


        accent:
            wishPreview
                .style
                .getPropertyValue(
                    "--accent"
                )
                .trim() ||
            "#B89CFF",


        titleFont:
            titleFont.value,

        bodyFont:
            bodyFont.value,

        fromFont:
            fromFont.value,


        titleSize:
            getTextSize(
                previewTitle
            ),

        bodySize:
            getTextSize(
                previewBody
            ),

        fromSize:
            getTextSize(
                previewFrom
            ),


        titleX:
            parseFloat(
                previewTitle.dataset.x
            ),

        titleY:
            parseFloat(
                previewTitle.dataset.y
            ),

        bodyX:
            parseFloat(
                previewBody.dataset.x
            ),

        bodyY:
            parseFloat(
                previewBody.dataset.y
            ),

        fromX:
            parseFloat(
                previewFrom.dataset.x
            ),

        fromY:
            parseFloat(
                previewFrom.dataset.y
            ),


        titleWeight:
            previewTitle.style.fontWeight,

        titleStyle:
            previewTitle.style.fontStyle,

        titleDecoration:
            previewTitle.style.textDecoration,

        titleColor:
            previewTitle.style.color,


        bodyWeight:
            previewBody.style.fontWeight,

        bodyStyle:
            previewBody.style.fontStyle,

        bodyDecoration:
            previewBody.style.textDecoration,

        bodyColor:
            previewBody.style.color,


        fromWeight:
            previewFrom.style.fontWeight,

        fromStyle:
            previewFrom.style.fontStyle,

        fromDecoration:
            previewFrom.style.textDecoration,

        fromColor:
            previewFrom.style.color,


        stickers:
            stickers

    };

}


// =====================================================
// CONTINUE TO CONSTELLATION
// =====================================================

const continueWish =
    document.getElementById(
        "continueWish"
    );


continueWish.addEventListener(
    "click",
    function() {

        /*
           HARD REQUIREMENT:
           user MUST be logged in.
        */

        if (!currentAccount) {

            waitingForConstellation =
                true;


            wishStudio.classList.add(
                "hidden"
            );


            openAccountForConstellation();


            return;

        }


        activeCardData =
            captureCardData();


        wishStudio.classList.add(
            "hidden"
        );


        openConstellationStudio();

    }
);


// =====================================================
// ACCOUNT
// =====================================================

const accountButton =
    document.getElementById(
        "accountButton"
    );


const accountAvatar =
    document.getElementById(
        "accountAvatar"
    );


const accountButtonLabel =
    document.getElementById(
        "accountButtonLabel"
    );


const accountModal =
    document.getElementById(
        "accountModal"
    );


const closeAccount =
    document.getElementById(
        "closeAccount"
    );


const accountChoice =
    document.getElementById(
        "accountChoice"
    );


const accountMessage =
    document.getElementById(
        "accountMessage"
    );


const signupForm =
    document.getElementById(
        "signupForm"
    );


const loginForm =
    document.getElementById(
        "loginForm"
    );


const accountProfile =
    document.getElementById(
        "accountProfile"
    );


const showSignup =
    document.getElementById(
        "showSignup"
    );


const showLogin =
    document.getElementById(
        "showLogin"
    );


const backFromSignup =
    document.getElementById(
        "backFromSignup"
    );


const backFromLogin =
    document.getElementById(
        "backFromLogin"
    );


const profilePicture =
    document.getElementById(
        "profilePicture"
    );


const profilePreview =
    document.getElementById(
        "profilePreview"
    );


const accountName =
    document.getElementById(
        "accountName"
    );


const accountPasscode =
    document.getElementById(
        "accountPasscode"
    );


const loginName =
    document.getElementById(
        "loginName"
    );


const loginPasscode =
    document.getElementById(
        "loginPasscode"
    );


const profilePageImage =
    document.getElementById(
        "profilePageImage"
    );


const profilePageName =
    document.getElementById(
        "profilePageName"
    );


const profileStats =
    document.getElementById(
        "profileStats"
    );


const profileConstellationCount =
    document.getElementById(
        "profileConstellationCount"
    );


const profileWishCount =
    document.getElementById(
        "profileWishCount"
    );


const userConstellationList =
    document.getElementById(
        "userConstellationList"
    );


const logoutAccount =
    document.getElementById(
        "logoutAccount"
    );


let profileImageData =
    "";


function showAccountView(
    view
) {

    accountChoice.classList.add(
        "hidden"
    );

    signupForm.classList.add(
        "hidden"
    );

    loginForm.classList.add(
        "hidden"
    );

    accountProfile.classList.add(
        "hidden"
    );


    if (view === "choice") {

        accountChoice.classList.remove(
            "hidden"
        );

    }


    if (view === "signup") {

        signupForm.classList.remove(
            "hidden"
        );

    }


    if (view === "login") {

        loginForm.classList.remove(
            "hidden"
        );

    }


    if (view === "profile") {

        accountProfile.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// ACCOUNT OPEN
// =====================================================

accountButton.addEventListener(
    "click",
    function() {

        accountModal.classList.remove(
            "hidden"
        );


        if (currentAccount) {

            updateAccountProfile();

        } else {

            accountMessage.textContent =
                "Create an account or log in to keep your constellations together.";

            showAccountView(
                "choice"
            );

        }

    }
);


closeAccount.addEventListener(
    "click",
    function() {

        accountModal.classList.add(
            "hidden"
        );

    }
);


// =====================================================
// ACCOUNT CHOICE
// =====================================================

showSignup.addEventListener(
    "click",
    function() {

        accountMessage.textContent =
            "Create your account.";

        showAccountView(
            "signup"
        );

    }
);


showLogin.addEventListener(
    "click",
    function() {

        accountMessage.textContent =
            "Log in to your account.";

        showAccountView(
            "login"
        );

    }
);


backFromSignup.addEventListener(
    "click",
    function() {

        accountMessage.textContent =
            "Create an account or log in to keep your constellations together.";

        showAccountView(
            "choice"
        );

    }
);


backFromLogin.addEventListener(
    "click",
    function() {

        accountMessage.textContent =
            "Create an account or log in to keep your constellations together.";

        showAccountView(
            "choice"
        );

    }
);


// =====================================================
// PROFILE IMAGE
// =====================================================

profilePicture.addEventListener(
    "change",
    function() {

        const file =
            profilePicture.files[0];


        if (!file) {
            return;
        }


        const validTypes = [

            "image/png",
            "image/jpeg",
            "image/webp"

        ];


        if (
            !validTypes.includes(
                file.type
            )
        ) {

            alert(
                "Please choose a PNG, JPG or WebP image."
            );


            profilePicture.value =
                "";


            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                profileImageData =
                    event.target.result;


                profilePreview.innerHTML =
                    "";


                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    profileImageData;


                profilePreview.appendChild(
                    img
                );

            };


        reader.readAsDataURL(
            file
        );

    }
);


// =====================================================
// SIGNUP
// =====================================================

signupForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            accountName.value.trim();


        const passcode =
            accountPasscode.value;


        if (!profileImageData) {

            alert(
                "A profile picture is required."
            );


            return;

        }


        if (
            passcode.length < 4
        ) {

            alert(
                "Your passcode must be at least 4 characters."
            );


            return;

        }


        const alreadyExists =
            accounts.some(
                function(account) {

                    return (
                        account.name.toLowerCase() ===
                        name.toLowerCase()
                    );

                }
            );


        if (alreadyExists) {

            alert(
                "An account with that name already exists in this session."
            );


            return;

        }


        const account = {

            id:
                Date.now(),

            name:
                name,

            passcode:
                passcode,

            profileImage:
                profileImageData,

            constellations:
                []

        };


        accounts.push(
            account
        );


        currentAccount =
            account;


        profileImageData =
            "";


        signupForm.reset();


        profilePreview.innerHTML =
            "♡";


        updateLoggedInUI();

        updateStatistics();


        accountModal.classList.add(
            "hidden"
        );


        /*
           The card that the user already created
           remains untouched while account creation
           happens.
        */

        if (
            waitingForConstellation
        ) {

            waitingForConstellation =
                false;


            activeCardData =
                captureCardData();


            openConstellationStudio();

        }

    }
);


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            loginName.value.trim();


        const passcode =
            loginPasscode.value;


        const account =
            accounts.find(
                function(item) {

                    return (
                        item.name.toLowerCase() ===
                        name.toLowerCase()
                    );

                }
            );


        if (!account) {

            alert(
                "No account with that name exists in this session."
            );


            return;

        }


        if (
            account.passcode !==
            passcode
        ) {

            alert(
                "Incorrect passcode."
            );


            return;

        }


        currentAccount =
            account;


        loginForm.reset();


        updateLoggedInUI();

        updateStatistics();


        accountModal.classList.add(
            "hidden"
        );


        if (
            waitingForConstellation
        ) {

            waitingForConstellation =
                false;


            activeCardData =
                captureCardData();


            openConstellationStudio();

        }

    }
);


// =====================================================
// ACCOUNT REQUIRED
// =====================================================

function openAccountForConstellation() {

    accountModal.classList.remove(
        "hidden"
    );


    accountMessage.textContent =
        "You need to log in or sign up before you can create a constellation.";


    showAccountView(
        "choice"
    );

}


// =====================================================
// ACCOUNT BUTTON AFTER LOGIN
// =====================================================

function updateLoggedInUI() {

    if (!currentAccount) {

        accountAvatar.innerHTML =
            "♡";


        accountButtonLabel.textContent =
            "Account";


        return;

    }


    accountAvatar.innerHTML =
        "";


    const img =
        document.createElement(
            "img"
        );


    img.src =
        currentAccount.profileImage;


    accountAvatar.appendChild(
        img
    );


    accountButtonLabel.textContent =
        currentAccount.name;

}


updateLoggedInUI();


// =====================================================
// ACCOUNT PROFILE
// =====================================================

function updateAccountProfile() {

    if (!currentAccount) {

        showAccountView(
            "choice"
        );


        return;

    }


    showAccountView(
        "profile"
    );


    profilePageName.textContent =
        currentAccount.name;


    profilePageImage.innerHTML =
        "";


    const img =
        document.createElement(
            "img"
        );


    img.src =
        currentAccount.profileImage;


    profilePageImage.appendChild(
        img
    );


    profileConstellationCount.textContent =
        currentAccount.constellations.length;


    profileWishCount.textContent =
        currentAccount.constellations.length;


    userConstellationList.innerHTML =
        "";


    if (
        currentAccount.constellations.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-account-message";


        empty.textContent =
            "No constellations yet ✦";


        userConstellationList.appendChild(
            empty
        );


        return;

    }


    currentAccount.constellations
        .slice()
        .reverse()
        .forEach(
            function(constellation) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "saved-constellation";


                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "saved-constellation-info";


                const strong =
                    document.createElement(
                        "strong"
                    );


                strong.textContent =
                    constellation.name;


                const small =
                    document.createElement(
                        "small"
                    );


                small.textContent =
                    `${constellation.stars.length} stars`;


                info.appendChild(
                    strong
                );


                info.appendChild(
                    small
                );


                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "saved-constellation-actions";


                const editButton =
                    document.createElement(
                        "button"
                    );


                editButton.type =
                    "button";


                editButton.textContent =
                    "Edit";


                editButton.addEventListener(
                    "click",
                    function(event) {

                        event.stopPropagation();


                        editOwnConstellation(
                            constellation.id
                        );

                    }
                );


                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.className =
                    "delete-constellation";

                deleteButton.textContent =
                    "Delete";


                deleteButton.addEventListener(
                    "click",
                    function(event) {

                        event.stopPropagation();


                        deleteOwnConstellation(
                            constellation.id
                        );

                    }
                );


                actions.appendChild(
                    editButton
                );


                actions.appendChild(
                    deleteButton
                );


                item.appendChild(
                    info
                );


                item.appendChild(
                    actions
                );


                userConstellationList.appendChild(
                    item
                );

            }
        );

}


// =====================================================
// DELETE OWN CONSTELLATION
// =====================================================

function deleteOwnConstellation(
    constellationId
) {

    if (!currentAccount) {
        return;
    }


    const index =
        currentAccount.constellations.findIndex(
            function(item) {

                return (
                    item.id ===
                    constellationId
                );

            }
        );


    if (
        index === -1
    ) {

        return;

    }


    const constellation =
        currentAccount.constellations[index];


    const confirmed =
        confirm(
            `Delete "${constellation.name}"?`
        );


    if (!confirmed) {

        return;

    }


    currentAccount.constellations.splice(
        index,
        1
    );


    const sessionIndex =
        sessionConstellations.findIndex(
            function(item) {

                return (
                    item.id ===
                    constellationId
                );

            }
        );


    if (
        sessionIndex !== -1
    ) {

        sessionConstellations.splice(
            sessionIndex,
            1
        );

    }


    removeConstellationFromSky(
        constellationId
    );


    updateStatistics();

    updateAccountProfile();

}


// =====================================================
// EDIT OWN CONSTELLATION
// =====================================================

function editOwnConstellation(
    constellationId
) {

    if (!currentAccount) {
        return;
    }


    const constellation =
        currentAccount.constellations.find(
            function(item) {

                return (
                    item.id ===
                    constellationId
                );

            }
        );


    if (!constellation) {
        return;
    }


    editingConstellationId =
        constellationId;


    activeCardData =
        JSON.parse(
            JSON.stringify(
                constellation.card
            )
        );


    restoreCardData(
        activeCardData
    );


    accountModal.classList.add(
        "hidden"
    );


    openWishStudio();

}


// =====================================================
// LOGOUT
// =====================================================

logoutAccount.addEventListener(
    "click",
    function() {

        currentAccount =
            null;


        updateLoggedInUI();

        updateStatistics();


        accountModal.classList.add(
            "hidden"
        );

    }
);


// =====================================================
// CONSTELLATION CREATOR
// =====================================================

const constellationStudio =
    document.getElementById(
        "constellationStudio"
    );


const closeConstellation =
    document.getElementById(
        "closeConstellation"
    );


const constellationCanvas =
    document.getElementById(
        "constellationCanvas"
    );


const constellationName =
    document.getElementById(
        "constellationName"
    );


const starTool =
    document.getElementById(
        "starTool"
    );


const connectTool =
    document.getElementById(
        "connectTool"
    );


const eraseTool =
    document.getElementById(
        "eraseTool"
    );


const saveConstellation =
    document.getElementById(
        "saveConstellation"
    );


let constellationMode =
    "star";


let constellationStars =
    [];


let constellationLines =
    [];


let selectedConstellationStar =
    null;


let constellationStarId =
    0;


function openConstellationStudio() {

    /*
       This is another safety layer:
       nobody can enter the canvas while logged out.
    */

    if (!currentAccount) {

        openAccountForConstellation();

        return;

    }


    constellationStudio.classList.remove(
        "hidden"
    );

}


closeConstellation.addEventListener(
    "click",
    function() {

        constellationStudio.classList.add(
            "hidden"
        );

    }
);


// =====================================================
// CONSTELLATION TOOLS
// =====================================================

function setConstellationMode(
    mode
) {

    constellationMode =
        mode;


    starTool.classList.toggle(
        "active",
        mode === "star"
    );


    connectTool.classList.toggle(
        "active",
        mode === "connect"
    );


    eraseTool.classList.toggle(
        "active",
        mode === "erase"
    );


    selectedConstellationStar =
        null;


    updateConstellationSelection();

}


starTool.addEventListener(
    "click",
    function() {

        setConstellationMode(
            "star"
        );

    }
);


connectTool.addEventListener(
    "click",
    function() {

        setConstellationMode(
            "connect"
        );

    }
);


eraseTool.addEventListener(
    "click",
    function() {

        setConstellationMode(
            "erase"
        );

    }
);


// =====================================================
// CANVAS COORDINATES
// =====================================================

function getCanvasCoordinates(
    event
) {

    const rect =
        constellationCanvas.getBoundingClientRect();


    return {

        x:
            event.clientX -
            rect.left,

        y:
            event.clientY -
            rect.top

    };

}


// =====================================================
// EMPTY STATE
// =====================================================

function updateConstellationEmptyMessage() {

    const empty =
        constellationCanvas.querySelector(
            ".constellation-empty-message"
        );


    if (!empty) {
        return;
    }


    empty.style.display =
        constellationStars.length === 0
            ? "block"
            : "none";

}


// =====================================================
// CREATE STAR
// =====================================================

function createConstellationStar(
    x,
    y
) {

    const id =
        ++constellationStarId;


    const star =
        document.createElement(
            "button"
        );


    star.type =
        "button";


    star.className =
        "constellation-star";


    star.dataset.starId =
        id;


    star.style.left =
        `${x}px`;


    star.style.top =
        `${y}px`;


    star.textContent =
        "✦";


    star.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            if (
                constellationMode ===
                "connect"
            ) {

                handleConnectStar(
                    id
                );


                return;

            }


            if (
                constellationMode ===
                "erase"
            ) {

                eraseConstellationStar(
                    id
                );


                return;

            }


            selectedConstellationStar =
                id;


            updateConstellationSelection();

        }
    );


    constellationCanvas.appendChild(
        star
    );


    constellationStars.push({

        id:
            id,

        x:
            x,

        y:
            y

    });


    updateConstellationEmptyMessage();

}


// =====================================================
// CANVAS
// =====================================================

constellationCanvas.addEventListener(
    "pointerdown",
    function(event) {

        if (
            event.target.closest(
                ".constellation-star"
            )
        ) {

            return;

        }


        if (
            constellationMode !==
            "star"
        ) {

            return;

        }


        const point =
            getCanvasCoordinates(
                event
            );


        createConstellationStar(
            point.x,
            point.y
        );

    }
);


// =====================================================
// CONNECT
// =====================================================

function handleConnectStar(
    starId
) {

    if (
        selectedConstellationStar ===
        null
    ) {

        selectedConstellationStar =
            starId;


        updateConstellationSelection();


        return;

    }


    if (
        selectedConstellationStar ===
        starId
    ) {

        return;

    }


    const exists =
        constellationLines.some(
            function(line) {

                return (

                    (
                        line.from ===
                        selectedConstellationStar &&
                        line.to ===
                        starId
                    ) ||

                    (
                        line.from ===
                        starId &&
                        line.to ===
                        selectedConstellationStar
                    )

                );

            }
        );


    if (!exists) {

        constellationLines.push({

            from:
                selectedConstellationStar,

            to:
                starId

        });

    }


    selectedConstellationStar =
        starId;


    drawConstellationLines();

}


// =====================================================
// DRAW LINES
// =====================================================

function drawConstellationLines() {

    constellationCanvas
        .querySelectorAll(
            ".constellation-line"
        )
        .forEach(
            function(line) {

                line.remove();

            }
        );


    constellationLines.forEach(
        function(connection) {

            const from =
                constellationStars.find(
                    function(star) {

                        return (
                            star.id ===
                            connection.from
                        );

                    }
                );


            const to =
                constellationStars.find(
                    function(star) {

                        return (
                            star.id ===
                            connection.to
                        );

                    }
                );


            if (
                !from ||
                !to
            ) {

                return;

            }


            const line =
                document.createElement(
                    "div"
                );


            line.className =
                "constellation-line";


            const dx =
                to.x -
                from.x;


            const dy =
                to.y -
                from.y;


            const length =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const angle =
                Math.atan2(
                    dy,
                    dx
                ) *
                180 /
                Math.PI;


            line.style.width =
                `${length}px`;


            line.style.left =
                `${from.x}px`;


            line.style.top =
                `${from.y}px`;


            line.style.transform =
                `rotate(${angle}deg)`;


            constellationCanvas.appendChild(
                line
            );

        }
    );


    updateConstellationSelection();

}


// =====================================================
// SELECTION
// =====================================================

function updateConstellationSelection() {

    constellationCanvas
        .querySelectorAll(
            ".constellation-star.selected"
        )
        .forEach(
            function(star) {

                star.classList.remove(
                    "selected"
                );

            }
        );


    if (
        selectedConstellationStar ===
        null
    ) {

        return;

    }


    const star =
        constellationCanvas.querySelector(
            `[data-star-id="${selectedConstellationStar}"]`
        );


    if (star) {

        star.classList.add(
            "selected"
        );

    }

}


// =====================================================
// ERASE
// =====================================================

function eraseConstellationStar(
    starId
) {

    constellationStars =
        constellationStars.filter(
            function(star) {

                return (
                    star.id !==
                    starId
                );

            }
        );


    constellationLines =
        constellationLines.filter(
            function(line) {

                return (
                    line.from !==
                    starId &&
                    line.to !==
                    starId
                );

            }
        );


    const element =
        constellationCanvas.querySelector(
            `[data-star-id="${starId}"]`
        );


    if (element) {

        element.remove();

    }


    selectedConstellationStar =
        null;


    drawConstellationLines();

    updateConstellationEmptyMessage();

}


// =====================================================
// RESET CONSTELLATION CANVAS
// =====================================================

function resetConstellationCanvas() {

    constellationStars =
        [];


    constellationLines =
        [];


    selectedConstellationStar =
        null;


    constellationName.value =
        "";


    constellationCanvas
        .querySelectorAll(
            ".constellation-star, .constellation-line"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );


    setConstellationMode(
        "star"
    );


    updateConstellationEmptyMessage();

}


// =====================================================
// SAVE CONSTELLATION
// =====================================================

saveConstellation.addEventListener(
    "click",
    function() {

        /*
           Double protection.
        */

        if (!currentAccount) {

            openAccountForConstellation();

            return;

        }


        if (
            constellationStars.length ===
            0
        ) {

            alert(
                "Add at least one star first ✦"
            );


            return;

        }


        const cardSnapshot =
            activeCardData ||
            captureCardData();


        const name =
            constellationName.value.trim() ||
            "My constellation";


        /*
           EDIT EXISTING CONSTELLATION
        */

        if (
            editingConstellationId !==
            null
        ) {

            const existing =
                currentAccount.constellations.find(
                    function(item) {

                        return (
                            item.id ===
                            editingConstellationId
                        );

                    }
                );


            if (existing) {

                existing.name =
                    name;


                existing.stars =
                    JSON.parse(
                        JSON.stringify(
                            constellationStars
                        )
                    );


                existing.lines =
                    JSON.parse(
                        JSON.stringify(
                            constellationLines
                        )
                    );


                existing.card =
                    JSON.parse(
                        JSON.stringify(
                            cardSnapshot
                        )
                    );


                existing.unopened =
                    true;


                const sessionExisting =
                    sessionConstellations.find(
                        function(item) {

                            return (
                                item.id ===
                                editingConstellationId
                            );

                        }
                    );


                if (sessionExisting) {

                    Object.assign(
                        sessionExisting,
                        existing
                    );

                }


                removeConstellationFromSky(
                    editingConstellationId
                );


                addConstellationToSky(
                    existing
                );


                editingConstellationId =
                    null;

            }

        } else {

            /*
               BRAND NEW CONSTELLATION
            */

            const constellation = {

                id:
                    Date.now(),

                name:
                    name,

                stars:
                    JSON.parse(
                        JSON.stringify(
                            constellationStars
                        )
                    ),

                lines:
                    JSON.parse(
                        JSON.stringify(
                            constellationLines
                        )
                    ),

                card:
                    JSON.parse(
                        JSON.stringify(
                            cardSnapshot
                        )
                    ),

                ownerId:
                    currentAccount.id,

                ownerName:
                    currentAccount.name,

                ownerProfileImage:
                    currentAccount.profileImage,

                unopened:
                    true

            };


            currentAccount.constellations.push(
                constellation
            );


            sessionConstellations.push(
                constellation
            );


            addConstellationToSky(
                constellation
            );

        }


        updateStatistics();

        updateAccountProfile();


        /*
           IMPORTANT:
           Reset the entire card automatically
           after successful save.

           So the next + starts fresh.
        */

        resetCardCreator();

        resetConstellationCanvas();


        activeCardData =
            null;


        constellationStudio.classList.add(
            "hidden"
        );


        alert(
            "Your constellation has been saved ✦"
        );

    }
);


// =====================================================
// SKY CONSTELLATIONS
// =====================================================

function addConstellationToSky(
    constellation
) {

    /*
       Remove any previous DOM version first.
    */

    removeConstellationFromSky(
        constellation.id
    );


    const wrapper =
        document.createElement(
            "button"
        );


    wrapper.type =
        "button";


    wrapper.className =
        "sky-constellation";


    wrapper.dataset.constellationId =
        constellation.id;


    wrapper.setAttribute(
        "aria-label",
        constellation.name
    );


    /*
       Normalized shape size.
       This means the constellation is always
       drawn correctly regardless of its canvas size.
    */

    const skyWidth = 150;
    const skyHeight = 120;


    const shape =
        document.createElement(
            "div"
        );


    shape.className =
        "sky-constellation-shape";


    constellation.stars.forEach(
        function(star) {

            const point =
                document.createElement(
                    "span"
                );


            point.className =
                "sky-constellation-star";


            point.style.left =
                `${star.x}px`;


            point.style.top =
                `${star.y}px`;


            shape.appendChild(
                point
            );

        }
    );


    const xs =
        constellation.stars.map(
            function(star) {

                return star.x;

            }
        );


    const ys =
        constellation.stars.map(
            function(star) {

                return star.y;

            }
        );


    const maxX =
        Math.max(
            ...xs,
            1
        );


    const maxY =
        Math.max(
            ...ys,
            1
        );


    const minX =
        Math.min(
            ...xs,
            0
        );


    const minY =
        Math.min(
            ...ys,
            0
        );


    const sourceWidth =
        Math.max(
            1,
            maxX - minX
        );


    const sourceHeight =
        Math.max(
            1,
            maxY - minY
        );


    const scale =
        Math.min(
            skyWidth / sourceWidth,
            skyHeight / sourceHeight,
            1
        );


    constellation.stars.forEach(
        function(star) {

            /*
               Move the entire constellation into
               a compact normalized shape.
            */

            const point =
                shape.querySelectorAll(
                    ".sky-constellation-star"
                )[

                    constellation.stars.indexOf(
                        star
                    )

                ];


            const normalizedX =
                (
                    star.x -
                    minX
                ) *
                scale;


            const normalizedY =
                (
                    star.y -
                    minY
                ) *
                scale;


            point.style.left =
                `${normalizedX}px`;


            point.style.top =
                `${normalizedY}px`;

        }
    );


    constellation.lines.forEach(
        function(connection) {

            const from =
                constellation.stars.find(
                    function(star) {

                        return (
                            star.id ===
                            connection.from
                        );

                    }
                );


            const to =
                constellation.stars.find(
                    function(star) {

                        return (
                            star.id ===
                            connection.to
                        );

                    }
                );


            if (
                !from ||
                !to
            ) {

                return;

            }


            const line =
                document.createElement(
                    "span"
                );


            line.className =
                "sky-constellation-line";


            const x1 =
                (
                    from.x -
                    minX
                ) *
                scale;


            const y1 =
                (
                    from.y -
                    minY
                ) *
                scale;


            const x2 =
                (
                    to.x -
                    minX
                ) *
                scale;


            const y2 =
                (
                    to.y -
                    minY
                ) *
                scale;


            const dx =
                x2 -
                x1;


            const dy =
                y2 -
                y1;


            const length =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const angle =
                Math.atan2(
                    dy,
                    dx
                ) *
                180 /
                Math.PI;


            line.style.width =
                `${length}px`;


            line.style.left =
                `${x1}px`;


            line.style.top =
                `${y1}px`;


            line.style.transform =
                `rotate(${angle}deg)`;


            shape.appendChild(
                line
            );

        }
    );


    wrapper.appendChild(
        shape
    );


    /*
       Position it somewhere in the sky.
       Save the position on the constellation object.
    */

    if (
        typeof constellation.skyX !==
        "number"
    ) {

        constellation.skyX =
            15 +
            Math.random() *
            70;

    }


    if (
        typeof constellation.skyY !==
        "number"
    ) {

        constellation.skyY =
            15 +
            Math.random() *
            60;

    }


    wrapper.style.left =
        `${constellation.skyX}%`;


    wrapper.style.top =
        `${constellation.skyY}%`;


    /*
       Only the owner can move it.
    */

    const isOwner =
        currentAccount &&
        constellation.ownerId ===
        currentAccount.id;


    if (
        isOwner
    ) {

        wrapper.classList.add(
            "own-constellation"
        );

        makeConstellationMovable(
            wrapper,
            constellation
        );

    }


    /*
       Click opens the card.
       Pointerdown stops sky dragging.
    */

    wrapper.addEventListener(
        "pointerdown",
        function(event) {

            event.stopPropagation();

        }
    );


    wrapper.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            openConstellationCard(
                constellation
            );

        }
    );


    if (
        constellation.unopened
    ) {

        wrapper.classList.add(
            "unopened-constellation"
        );

    }


    space.appendChild(
        wrapper
    );

}


// =====================================================
// MOVE OWN CONSTELLATION
// =====================================================

function makeConstellationMovable(
    element,
    constellation
) {

    let dragging =
        false;


    let moved =
        false;


    let startPointerX =
        0;


    let startPointerY =
        0;


    let startPercentX =
        0;


    let startPercentY =
        0;


    element.addEventListener(
        "pointerdown",
        function(event) {

            /*
               Ownership check.
            */

            if (
                !currentAccount ||
                constellation.ownerId !==
                currentAccount.id
            ) {

                return;

            }


            event.stopPropagation();


            dragging =
                true;


            moved =
                false;


            startPointerX =
                event.clientX;


            startPointerY =
                event.clientY;


            startPercentX =
                constellation.skyX;


            startPercentY =
                constellation.skyY;


            element.setPointerCapture(
                event.pointerId
            );

        }
    );


    element.addEventListener(
        "pointermove",
        function(event) {

            if (!dragging) {
                return;
            }


            event.stopPropagation();


            const rect =
                sky.getBoundingClientRect();


            const dx =
                event.clientX -
                startPointerX;


            const dy =
                event.clientY -
                startPointerY;


            if (
                Math.abs(dx) > 4 ||
                Math.abs(dy) > 4
            ) {

                moved =
                    true;

            }


            const x =
                startPercentX +
                dx /
                rect.width *
                100;


            const y =
                startPercentY +
                dy /
                rect.height *
                100;


            constellation.skyX =
                Math.max(
                    5,
                    Math.min(
                        95,
                        x
                    )
                );


            constellation.skyY =
                Math.max(
                    5,
                    Math.min(
                        90,
                        y
                    )
                );


            element.style.left =
                `${constellation.skyX}%`;


            element.style.top =
                `${constellation.skyY}%`;

        }
    );


    element.addEventListener(
        "pointerup",
        function(event) {

            if (!dragging) {
                return;
            }


            dragging =
                false;


            element.releasePointerCapture?.(
                event.pointerId
            );


            /*
               Prevent a click immediately after
               a real drag.
            */

            if (moved) {

                element.dataset.justMoved =
                    "true";


                setTimeout(
                    function() {

                        element.dataset.justMoved =
                            "false";

                    },
                    100
                );

            }

        }
    );


    element.addEventListener(
        "click",
        function(event) {

            if (
                element.dataset.justMoved ===
                "true"
            ) {

                event.stopImmediatePropagation();

            }

        },
        true
    );

}


// =====================================================
// REMOVE CONSTELLATION FROM SKY
// =====================================================

function removeConstellationFromSky(
    constellationId
) {

    const element =
        space.querySelector(
            `.sky-constellation[data-constellation-id="${constellationId}"]`
        );


    if (element) {

        element.remove();

    }

}


// =====================================================
// OPEN CONSTELLATION CARD
// =====================================================

function openConstellationCard(
    constellation
) {

    /*
       Verify the constellation still exists
       in the current session.
    */

    const actual =
        sessionConstellations.find(
            function(item) {

                return (
                    item.id ===
                    constellation.id
                );

            }
        );


    if (!actual) {

        return;

    }


    /*
       Mark unopened as opened.
    */

    actual.unopened =
        false;


    const account =
        accounts.find(
            function(item) {

                return (
                    item.id ===
                    actual.ownerId
                );

            }
        );


    if (
        account
    ) {

        const own =
            account.constellations.find(
                function(item) {

                    return (
                        item.id ===
                        actual.id
                    );

                }
            );


        if (own) {

            own.unopened =
                false;

        }

    }


    const skyElement =
        space.querySelector(
            `.sky-constellation[data-constellation-id="${actual.id}"]`
        );


    if (
        skyElement
    ) {

        skyElement.classList.remove(
            "unopened-constellation"
        );

    }


    updateStatistics();


    renderSavedCard(
        actual
    );

}


// =====================================================
// SAVED CARD VIEWER
// =====================================================

const savedCardViewer =
    document.getElementById(
        "savedCardViewer"
    );


const closeSavedCard =
    document.getElementById(
        "closeSavedCard"
    );


const savedCardPreview =
    document.getElementById(
        "savedCardPreview"
    );


const savedCardTexture =
    document.getElementById(
        "savedCardTexture"
    );


const savedCardFrame =
    document.getElementById(
        "savedCardFrame"
    );


const savedCardTitle =
    document.getElementById(
        "savedCardTitle"
    );


const savedCardBody =
    document.getElementById(
        "savedCardBody"
    );


const savedCardFrom =
    document.getElementById(
        "savedCardFrom"
    );


const savedCardAuthorImage =
    document.getElementById(
        "savedCardAuthorImage"
    );


const savedCardAuthorName =
    document.getElementById(
        "savedCardAuthorName"
    );


closeSavedCard.addEventListener(
    "click",
    function() {

        savedCardViewer.classList.add(
            "hidden"
        );

    }
);


// =====================================================
// RENDER EXACT SAVED CARD
// =====================================================

function renderSavedCard(
    constellation
) {

    const card =
        constellation.card;


    if (!card) {
        return;
    }


    savedCardViewer.classList.remove(
        "hidden"
    );


    /*
       CARD BACKGROUND
    */

    savedCardPreview.className =
        "wish-preview saved-card-preview";


    savedCardPreview.classList.add(
        `theme-${card.theme}`
    );


    savedCardPreview.classList.add(
        `background-${card.background}`
    );


    savedCardPreview.style.setProperty(
        "--accent",
        card.accent
    );


    /*
       FRAME
    */

    savedCardFrame.className =
        "card-frame";


    savedCardFrame.classList.add(
        `border-${card.border}`
    );


    /*
       TEXT
    */

    savedCardTitle.textContent =
        card.title ||
        "Happy Birthday! ✨";


    savedCardBody.textContent =
        card.body ||
        "Your beautiful birthday message will appear here...";


    savedCardFrom.textContent =
        card.from ||
        "— Your bestie ♡";


    /*
       FONT
    */

    applySavedFont(
        savedCardTitle,
        card.titleFont
    );


    applySavedFont(
        savedCardBody,
        card.bodyFont
    );


    applySavedFont(
        savedCardFrom,
        card.fromFont
    );


    /*
       SIZE
    */

    savedCardTitle.style.fontSize =
        `${card.titleSize}px`;


    savedCardBody.style.fontSize =
        `${card.bodySize}px`;


    savedCardFrom.style.fontSize =
        `${card.fromSize}px`;


    /*
       LOCATION
    */

    savedCardTitle.style.left =
        `${card.titleX}%`;


    savedCardTitle.style.top =
        `${card.titleY}%`;


    savedCardBody.style.left =
        `${card.bodyX}%`;


    savedCardBody.style.top =
        `${card.bodyY}%`;


    savedCardFrom.style.left =
        `${card.fromX}%`;


    savedCardFrom.style.top =
        `${card.fromY}%`;


    /*
       FORMATTING
    */

    savedCardTitle.style.fontWeight =
        card.titleWeight || "400";


    savedCardTitle.style.fontStyle =
        card.titleStyle || "normal";


    savedCardTitle.style.textDecoration =
        card.titleDecoration || "none";


    savedCardTitle.style.color =
        card.titleColor || "";


    savedCardBody.style.fontWeight =
        card.bodyWeight || "400";


    savedCardBody.style.fontStyle =
        card.bodyStyle || "normal";


    savedCardBody.style.textDecoration =
        card.bodyDecoration || "none";


    savedCardBody.style.color =
        card.bodyColor || "";


    savedCardFrom.style.fontWeight =
        card.fromWeight || "400";


    savedCardFrom.style.fontStyle =
        card.fromStyle || "normal";


    savedCardFrom.style.textDecoration =
        card.fromDecoration || "none";


    savedCardFrom.style.color =
        card.fromColor || "";


    /*
       AUTHOR
    */

    savedCardAuthorName.textContent =
        constellation.ownerName ||
        "Unknown";


    savedCardAuthorImage.innerHTML =
        "";


    const authorImage =
        document.createElement(
            "img"
        );


    authorImage.src =
        constellation.ownerProfileImage;


    savedCardAuthorImage.appendChild(
        authorImage
    );


    /*
       REMOVE PREVIOUS STICKERS
    */

    savedCardPreview
        .querySelectorAll(
            ".card-sticker"
        )
        .forEach(
            function(sticker) {

                sticker.remove();

            }
        );


    /*
       RESTORE EVERY STICKER
    */

    card.stickers.forEach(
        function(stickerData) {

            const sticker =
                stickerData.type ===
                "image"

                    ? document.createElement(
                        "img"
                    )

                    : document.createElement(
                        "div"
                    );


            sticker.className =
                "card-sticker";


            if (
                stickerData.type ===
                "image"
            ) {

                sticker.src =
                    stickerData.content;


                sticker.style.width =
                    `${stickerData.size}px`;


                sticker.style.height =
                    `${stickerData.size}px`;


                sticker.style.objectFit =
                    "contain";

            } else {

                sticker.textContent =
                    stickerData.content;


                sticker.style.fontSize =
                    `${stickerData.size}px`;

            }


            sticker.style.left =
                `${stickerData.x}px`;


            sticker.style.top =
                `${stickerData.y}px`;


            sticker.style.transform =
                `translate(-50%,-50%) rotate(${stickerData.rotation}deg)`;


            savedCardPreview.appendChild(
                sticker
            );

        }
    );

}


// =====================================================
// SAVED FONT
// =====================================================

function applySavedFont(
    element,
    fontName
) {

    fontClasses.forEach(
        function(className) {

            element.classList.remove(
                className
            );

        }
    );


    element.classList.add(
        `font-${fontName}`
    );

}


// =====================================================
// RESTORE CARD FOR EDITING
// =====================================================

function restoreCardData(
    card
) {

    wishTitle.value =
        card.title || "";


    wishBody.value =
        card.body || "";


    wishFrom.value =
        card.from || "";


    previewTitle.textContent =
        card.title ||
        "Happy Birthday! ✨";


    previewBody.textContent =
        card.body ||
        "Your beautiful birthday message will appear here...";


    previewFrom.textContent =
        card.from ||
        "— Your bestie ♡";


    updateBodyPlaceholder();


    titleFont.value =
        card.titleFont ||
        "elegant";


    bodyFont.value =
        card.bodyFont ||
        "elegant";


    fromFont.value =
        card.fromFont ||
        "handwritten";


    applyFont(
        previewTitle,
        titleFont.value
    );


    applyFont(
        previewBody,
        bodyFont.value
    );


    applyFont(
        previewFrom,
        fromFont.value
    );


    titleSize.value =
        card.titleSize;


    bodySize.value =
        card.bodySize;


    fromSize.value =
        card.fromSize;


    previewTitle.style.fontSize =
        `${card.titleSize}px`;


    previewBody.style.fontSize =
        `${card.bodySize}px`;


    previewFrom.style.fontSize =
        `${card.fromSize}px`;


    previewTitle.dataset.x =
        card.titleX;


    previewTitle.dataset.y =
        card.titleY;


    previewBody.dataset.x =
        card.bodyX;


    previewBody.dataset.y =
        card.bodyY;


    previewFrom.dataset.x =
        card.fromX;


    previewFrom.dataset.y =
        card.fromY;


    previewTitle.style.left =
        `${card.titleX}%`;


    previewTitle.style.top =
        `${card.titleY}%`;


    previewBody.style.left =
        `${card.bodyX}%`;


    previewBody.style.top =
        `${card.bodyY}%`;


    previewFrom.style.left =
        `${card.fromX}%`;


    previewFrom.style.top =
        `${card.fromY}%`;


    previewTitle.style.fontWeight =
        card.titleWeight || "400";


    previewTitle.style.fontStyle =
        card.titleStyle || "normal";


    previewTitle.style.textDecoration =
        card.titleDecoration || "none";


    previewTitle.style.color =
        card.titleColor || "";


    previewBody.style.fontWeight =
        card.bodyWeight || "400";


    previewBody.style.fontStyle =
        card.bodyStyle || "normal";


    previewBody.style.textDecoration =
        card.bodyDecoration || "none";


    previewBody.style.color =
        card.bodyColor || "";


    previewFrom.style.fontWeight =
        card.fromWeight || "400";


    previewFrom.style.fontStyle =
        card.fromStyle || "normal";


    previewFrom.style.textDecoration =
        card.fromDecoration || "none";


    previewFrom.style.color =
        card.fromColor || "";


    selectedTheme =
        card.theme ||
        "midnight";


    selectedBackground =
        card.background ||
        "plain";


    selectedBorder =
        card.border ||
        "none";


    updateThemeButtons();
    updateTheme();


    updateBackgroundButtons();
    updateBackground();


    updateBorderButtons();
    updateBorder();


    setAccentColor(
        card.accent ||
        "#B89CFF"
    );


    customColor.value =
        card.accent ||
        "#B89CFF";


    resetFormattingButtonsFromCard(
        card
    );


    /*
       Restore stickers
    */

    wishPreview
        .querySelectorAll(
            ".card-sticker"
        )
        .forEach(
            function(sticker) {

                sticker.remove();

            }
        );


    stickerCounter =
        0;


    card.stickers.forEach(
        function(stickerData) {

            if (
                stickerData.type ===
                "image"
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.className =
                    "card-sticker";


                image.src =
                    stickerData.content;


                image.dataset.size =
                    stickerData.size;


                image.dataset.rotation =
                    stickerData.rotation;


                image.style.width =
                    `${stickerData.size}px`;


                image.style.height =
                    `${stickerData.size}px`;


                image.style.objectFit =
                    "contain";


                image.style.left =
                    `${stickerData.x}px`;


                image.style.top =
                    `${stickerData.y}px`;


                image.style.transform =
                    `translate(-50%,-50%) rotate(${stickerData.rotation}deg)`;


                wishPreview.appendChild(
                    image
                );


                makeStickerDraggable(
                    image
                );

            } else {

                addCardSticker(
                    stickerData.content,
                    stickerData.size,
                    stickerData.x,
                    stickerData.y,
                    stickerData.rotation
                );

            }

        }
    );

}


function resetFormattingButtonsFromCard(
    card
) {

    formattingControls.title.bold.classList.toggle(
        "active",
        card.titleWeight ===
        "700"
    );


    formattingControls.title.italic.classList.toggle(
        "active",
        card.titleStyle ===
        "italic"
    );


    formattingControls.title.underline.classList.toggle(
        "active",
        card.titleDecoration ===
        "underline"
    );


    formattingControls.body.bold.classList.toggle(
        "active",
        card.bodyWeight ===
        "700"
    );


    formattingControls.body.italic.classList.toggle(
        "active",
        card.bodyStyle ===
        "italic"
    );


    formattingControls.body.underline.classList.toggle(
        "active",
        card.bodyDecoration ===
        "underline"
    );


    formattingControls.from.bold.classList.toggle(
        "active",
        card.fromWeight ===
        "700"
    );


    formattingControls.from.italic.classList.toggle(
        "active",
        card.fromStyle ===
        "italic"
    );


    formattingControls.from.underline.classList.toggle(
        "active",
        card.fromDecoration ===
        "underline"
    );

}


// =====================================================
// ACCOUNT PROFILE UPDATE
// =====================================================

function refreshAllSkyOwnership() {

    space
        .querySelectorAll(
            ".sky-constellation"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );


    sessionConstellations.forEach(
        function(constellation) {

            addConstellationToSky(
                constellation
            );

        }
    );

}


function syncAccountAfterEdit(
    constellation
) {

    const account =
        accounts.find(
            function(item) {

                return (
                    item.id ===
                    constellation.ownerId
                );

            }
        );


    if (!account) {
        return;
    }


    const own =
        account.constellations.find(
            function(item) {

                return (
                    item.id ===
                    constellation.id
                );

            }
        );


    if (own) {

        Object.assign(
            own,
            JSON.parse(
                JSON.stringify(
                    constellation
                )
            )
        );

    }

}


// =====================================================
// UNOPENED STAT CLICK
// =====================================================

document.getElementById(
    "unopenedStat"
).addEventListener(
    "click",
    function() {

        const unopened =
            sessionConstellations.filter(
                function(item) {

                    return item.unopened;

                }
            );


        if (
            unopened.length ===
            0
        ) {

            return;

        }


        openConstellationCard(
            unopened[0]
        );

    }
);


// =====================================================
// INITIAL STATE
// =====================================================

resetCardCreator();

resetConstellationCanvas();

updateStatistics();

updateLoggedInUI();