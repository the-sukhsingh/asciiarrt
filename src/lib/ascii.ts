export const ASCII_CHARSETS = {
    standard: '@%#*+=-:. ',
    detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\\\|()1{}[]?-_+~<>i!lI;:,\\\"^`'. ",
    blocks: "█▓▒░ ",
    binary: "01 ",
    matrix: "日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ1234567890 ",
};

export async function imageToAscii(
    imgUrl: string,
    outWidth: number,
    charset: string = ASCII_CHARSETS.standard
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Canvas not supported");

            const aspect = img.height / img.width;
            const outHeight = Math.max(1, Math.floor(outWidth * aspect * 0.55));

            canvas.width = Math.max(1, outWidth);
            canvas.height = outHeight;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;

            let asciiStr = "";
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const offset = (y * canvas.width + x) * 4;
                    const r = pixels[offset];
                    const g = pixels[offset + 1];
                    const b = pixels[offset + 2];
                    const a = pixels[offset + 3];

                    if (a === 0) {
                        asciiStr += " ";
                        continue;
                    }

                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    const charIndex = Math.floor((1 - brightness) * (charset.length - 1));
                    asciiStr += charset[charIndex] || " ";
                }
                asciiStr += "\n";
            }

            resolve(asciiStr);
        };
        img.onerror = () => reject("Failed to load image");
        img.src = imgUrl;
    });
}

export async function textToAscii(
    text: string,
    outWidth: number,
    charset: string = ASCII_CHARSETS.standard
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas not supported");

        const fontSize = 48;
        ctx.font = `bold ${fontSize}px monospace`;

        const metrics = ctx.measureText(text);
        canvas.width = metrics.width + 40;
        canvas.height = fontSize + 40;

        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const imgUrl = canvas.toDataURL("image/png");
        imageToAscii(imgUrl, outWidth, charset).then(resolve).catch(reject);
    });
}

const UNICODE_MAPS: Record<string, Record<string, string>> = {
    fraktur: {
        'a': '𝔞', 'b': 'b', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦', 'j': '𝔧',
        'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 's': '𝔰', 't': '𝔱',
        'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷',
        'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ', 'J': '𝔍',
        'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ', 'S': '𝔖', 'T': '𝔗',
        'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ',
    },
    fullwidth: {
        'a': 'ａ', 'b': 'ｂ', 'c': 'ｃ', 'd': 'ｄ', 'e': 'ｅ', 'f': 'ｆ', 'g': 'ｇ', 'h': 'ｈ', 'i': 'ｉ', 'j': 'ｊ',
        'k': 'ｋ', 'l': 'ｌ', 'm': 'ｍ', 'n': 'ｎ', 'o': 'ｏ', 'p': 'ｐ', 'q': 'ｑ', 'r': 'ｒ', 's': 'ｓ', 't': 'ｔ',
        'u': 'ｕ', 'v': 'ｖ', 'w': 'ｗ', 'x': 'ｘ', 'y': 'ｙ', 'z': 'ｚ',
        'A': 'Ａ', 'B': 'Ｂ', 'C': 'Ｃ', 'D': 'Ｄ', 'E': 'Ｅ', 'F': 'Ｆ', 'G': 'Ｇ', 'H': 'Ｈ', 'I': 'Ｉ', 'J': 'Ｊ',
        'K': 'Ｋ', 'L': 'Ｌ', 'M': 'Ｍ', 'N': 'Ｎ', 'O': 'Ｏ', 'P': 'Ｐ', 'Q': 'Ｑ', 'R': 'Ｒ', 'S': 'Ｓ', 'T': 'Ｔ',
        'U': 'Ｕ', 'V': 'Ｖ', 'W': 'Ｗ', 'X': 'Ｘ', 'Y': 'Ｙ', 'Z': 'Ｚ',
        '0': '０', '1': '１', '2': '２', '3': '３', '4': '４', '5': '５', '6': '６', '7': '７', '8': '８', '9': '９'
    },
    script: {
        'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': 'ℯ', 'f': '𝒻', 'g': 'ℊ', 'h': '𝒽', 'i': '𝒾', 'j': '𝒿',
        'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': 'ℴ', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉',
        'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏',
        'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢', 'H': 'ℋ', 'I': 'ℐ', 'J': '𝒥',
        'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯',
        'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵'
    }
};

export function transformText(text: string, style: keyof typeof UNICODE_MAPS): string {
    if (!UNICODE_MAPS[style]) return text;

    const map = UNICODE_MAPS[style];
    return text.split('').map(char => map[char] || char).join('');
}

export const TEMPLATES = [
    {
        name: "Heart",
        art: [
            "     ******       ******",
            "   **********   **********",
            " ************* *************",
            "*****************************",
            "*****************************",
            "*****************************",
            " ***************************",
            "   ***********************",
            "     *******************",
            "       ***************",
            "         ***********",
            "           *******",
            "             ***",
            "              *"
        ].join('\n')
    },
    {
        name: "Sword",
        art: [
            "      /| ________________",
            "O|===|* >________________>",
            "      \\\\|"
        ].join('\n')
    },
    {
        name: "Cat",
        art: [
            " /\\\\_/\\\\",
            "( o.o )",
            " > ^ <"
        ].join('\n')
    },
    {
        name: "Space Shuttle",
        art: [
            "       /\\\\",
            "      |  |",
            "     /    \\\\",
            "    |      |",
            "   /        \\\\",
            "  |          |",
            " /            \\\\",
            "|     NASA     |",
            "|              |",
            " \\\\            /",
            "  \\\\          /",
            " __\\\\        /__",
            "[__]======[__]"
        ].join('\n')
    }
];
