"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Type, Image as ImageIcon, Copy, Download, LibraryBig, Settings2, Sparkles, TerminalSquare } from "lucide-react";
import { toPng } from "html-to-image";
import { ASCII_CHARSETS, imageToAscii, textToAscii, transformText, TEMPLATES } from "@/lib/ascii";

export function AsciiConverter() {
    const [activeTab, setActiveTab] = useState<"image" | "text" | "templates">("image");
    const [output, setOutput] = useState<string>("");

    // Shared setting
    const [colorMode, setColorMode] = useState<"lime" | "amber" | "white" | "red" | "cyan">("lime");
    const [invert, setInvert] = useState(false);

    // Image states
    const [imageUrl, setImageUrl] = useState<string>("");
    const [resolution, setResolution] = useState(80);
    const [charsetId, setCharsetId] = useState<keyof typeof ASCII_CHARSETS | "custom">("standard");
    const [customCharset, setCustomCharset] = useState("@%#*+=-:. ");
    const [isProcessing, setIsProcessing] = useState(false);

    // Text states
    const [textInput, setTextInput] = useState("RAW DATA");
    const [textStyle, setTextStyle] = useState<"fraktur" | "fullwidth" | "script" | "ascii_art">("ascii_art");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLPreElement>(null);

    const getActiveCharset = () => {
        let cs = charsetId === "custom" ? customCharset : ASCII_CHARSETS[charsetId];
        if (!cs) cs = ASCII_CHARSETS.standard;
        if (invert) return cs.split("").reverse().join("");
        return cs;
    };

    const processTextArt = async (txt: string, res: number) => {
        if (!txt) return setOutput("");
        setIsProcessing(true);
        try {
            const ascii = await textToAscii(txt, res, getActiveCharset());
            setOutput(ascii);
        } catch (err) {
            console.error(err);
            setOutput("ERR_PRC_TXT");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (activeTab === "text") {
            if (textStyle === "ascii_art") {
                processTextArt(textInput, resolution);
            } else {
                setOutput(transformText(textInput, textStyle));
            }
        }
    }, [activeTab, textInput, textStyle, resolution, charsetId, customCharset, invert]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            processImage(url, resolution);
        }
    };

    const processImage = async (url: string, res: number) => {
        if (!url) return;
        setIsProcessing(true);
        try {
            const ascii = await imageToAscii(url, res, getActiveCharset());
            setOutput(ascii);
        } catch (err) {
            console.error(err);
            setOutput("ERR_PRC_IMG");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (activeTab === "image" && imageUrl) {
            processImage(imageUrl, resolution);
        }
    }, [resolution, charsetId, customCharset, invert]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
    };

    const downloadText = () => {
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data_export.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadImage = async () => {
        if (!outputRef.current) return;
        try {
            const bgColor = {
                lime: '#050505',
                amber: '#050505',
                white: '#000000',
                red: '#050505',
                cyan: '#000'
            }[colorMode];
            const dataUrl = await toPng(outputRef.current, {
                backgroundColor: bgColor,
                style: { padding: '32px', margin: '0' }
            });
            const link = document.createElement('a');
            link.download = 'render.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to download image', err);
        }
    };

    const colorClasses = {
        lime: "text-lime-500 selection:bg-lime-500/30",
        amber: "text-amber-500 selection:bg-amber-500/30",
        white: "text-neutral-100 selection:bg-white/30",
        red: "text-red-500 selection:bg-red-500/30",
        cyan: "text-cyan-400 selection:bg-cyan-400/30"
    };

    const renderCharsetControls = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Density [{resolution}px]</label>
                </div>
                <input
                    type="range"
                    min="20"
                    max="300"
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-800 appearance-none outline-none accent-lime-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-lime-400 cursor-ew-resize"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Character Dictionary</label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: "standard", label: "STD" },
                        { id: "detailed", label: "DTL" },
                        { id: "blocks", label: "BLK" },
                        { id: "binary", label: "BIN" },
                        { id: "matrix", label: "MTX" },
                        { id: "custom", label: "CST" }
                    ].map((cs) => (
                        <button
                            key={cs.id}
                            onClick={() => setCharsetId(cs.id as any)}
                            className={
                                "px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors border " +
                                (charsetId === cs.id
                                    ? "bg-lime-400 text-black border-lime-400"
                                    : "bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-500 hover:text-white")
                            }
                        >
                            {cs.label}
                        </button>
                    ))}
                </div>
            </div>

            {charsetId === "custom" && (
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Custom Characters (Dark to Light)</label>
                    <input
                        type="text"
                        value={customCharset}
                        onChange={(e) => setCustomCharset(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono text-lime-400 outline-none focus:border-lime-400 transition-colors"
                        placeholder="e.g. 01@#"
                    />
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setInvert(!invert)}
                    className={"w-10 h-5 border flex items-center p-0.5 transition-colors " + (invert ? "border-lime-400" : "border-neutral-800")}
                >
                    <div className={"h-full w-4 transition-transform " + (invert ? "bg-lime-400 translate-x-4" : "bg-neutral-600")} />
                </button>
                <label className={"text-[10px] uppercase font-bold tracking-widest " + (invert ? "text-lime-400" : "text-neutral-500")}>
                    Invert Colors
                </label>
            </div>
        </div>
    );

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start lg:items-stretch font-mono lg:h-[calc(100vh-200px)] lg:min-h-[600px] lg:max-h-[900px]">

            {/* Config Sidebar */}
            <div className="w-full flex flex-col gap-6 h-full min-h-0">

                {/* Main Tabs */}
                <div className="flex border-b border-neutral-800 shrink-0">
                    {[
                        { id: "image", icon: ImageIcon, label: "IMAGE_IN" },
                        { id: "text", icon: Type, label: "TEXT_IN" },
                        { id: "templates", icon: LibraryBig, label: "ARCHIVE" }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={
                                    "flex-1 py-3 px-2 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-colors " +
                                    (activeTab === tab.id ? "border-lime-400 text-lime-400" : "border-transparent text-neutral-500 hover:text-neutral-300")
                                }
                            >
                                <Icon size={14} /> <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-black border border-neutral-800 p-6 flex flex-col gap-8 relative overflow-hidden flex-1">
                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                        <Settings2 size={64} />
                    </div>

                    <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
                        {activeTab === "image" && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Source Image</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-32 border border-neutral-800 border-dashed hover:border-lime-400/50 hover:bg-lime-400/5 transition-colors cursor-pointer flex flex-col justify-center items-center relative overflow-hidden group"
                                    >
                                        {imageUrl ? (
                                            <div className="w-full h-full p-1 opacity-75 group-hover:opacity-100 transition-opacity">
                                                <img src={imageUrl} alt="preview" className="w-full h-full object-cover mix-blend-luminosity" />
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] tracking-widest bg-black px-3 py-1 text-white border border-neutral-800">REPLACE</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-neutral-600 flex flex-col items-center gap-2">
                                                <Upload size={20} />
                                                <span className="text-[10px] font-bold tracking-widest">CLICK TO MOUNT DATA</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </div>
                                {renderCharsetControls()}
                            </div>
                        )}

                        {activeTab === "text" && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Input String</label>
                                    <textarea
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        className="w-full h-24 bg-transparent border border-neutral-800 p-3 text-xs font-mono text-white outline-none focus:border-lime-400 resize-none transition-colors"
                                        placeholder="DATA..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Algorithm</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: "ascii_art", label: "ASCII_ART" },
                                            { id: "fraktur", label: "GOTHIC" },
                                            { id: "fullwidth", label: "WIDE" },
                                            { id: "script", label: "CURSIVE" }
                                        ].map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setTextStyle(style.id as any)}
                                                className={
                                                    "py-2 px-3 text-[10px] font-bold tracking-widest uppercase transition-colors border " +
                                                    (textStyle === style.id ? "bg-white text-black border-white" : "bg-transparent text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-500")
                                                }
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {textStyle === "ascii_art" && renderCharsetControls()}
                            </div>
                        )}

                        {activeTab === "templates" && (
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Stored Arrays</label>
                                <div className="grid grid-cols-1 gap-2 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {TEMPLATES.map((tmpl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setOutput(tmpl.art)}
                                            className="p-3 border border-neutral-800 text-left hover:border-lime-400 transition-colors group bg-neutral-950/50"
                                        >
                                            <div className="text-[10px] font-bold tracking-widest text-neutral-300 group-hover:text-lime-400 mb-2">{tmpl.name}</div>
                                            <pre className="text-[6px] text-neutral-600 leading-none group-hover:text-neutral-400 transition-colors">
                                                {tmpl.art.split('\n').slice(0, 5).join('\n') + '...'}
                                            </pre>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Output Display */}
            <div className="w-full flex flex-col border border-neutral-800 bg-black min-h-[500px] lg:min-h-0 h-full relative min-w-0">

                {/* Header */}
                <div className="border-b border-neutral-800 bg-neutral-950 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <TerminalSquare size={16} className="text-lime-400" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-300">Terminal_OUT</span>
                        <div className="h-4 w-px bg-neutral-800 hidden sm:block"></div>

                        {/* Phosphor Mode Selector */}
                        <div className="flex gap-1 bg-black p-1 border border-neutral-800">
                            {[
                                { id: "lime", bg: "bg-lime-500" },
                                { id: "amber", bg: "bg-amber-500" },
                                { id: "white", bg: "bg-white" },
                                { id: "cyan", bg: "bg-cyan-400" },
                                { id: "red", bg: "bg-red-500" }
                            ].map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setColorMode(c.id as any)}
                                    className={"w-3 h-3 " + c.bg + " " + (colorMode === c.id ? "ring-1 ring-offset-2 ring-offset-black ring-neutral-500" : "opacity-50 hover:opacity-100 transition-opacity")}
                                    title={`Phosphor: ${c.id}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={copyToClipboard} className="px-3 py-1.5 border border-neutral-800 hover:border-white text-neutral-400 hover:text-white transition-colors flex items-center gap-2" title="Copy Text">
                            <Copy size={14} /> <span className="text-[10px] font-bold tracking-widest hidden lg:inline">COPY</span>
                        </button>
                        <button onClick={downloadImage} className="px-3 py-1.5 border border-neutral-800 hover:border-lime-400 text-neutral-400 hover:text-lime-400 transition-colors flex items-center gap-2" title="Download Image">
                            <ImageIcon size={14} /> <span className="text-[10px] font-bold tracking-widest hidden lg:inline">PNG</span>
                        </button>
                        <button onClick={downloadText} className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 transition-colors flex items-center gap-2" title="Download Text">
                            <Download size={14} /> <span className="text-[10px] font-bold tracking-widest hidden lg:inline">TXT</span>
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="relative flex-1 p-6 overflow-hidden flex flex-col items-center justify-center min-h-0 min-w-0">
                    {/* CRT Scanline overlay effect */}
                    <div className="pointer-events-none absolute inset-0 z-10 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]" />
                    <div className="pointer-events-none absolute inset-0 z-10 mix-blend-screen opacity-5 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />

                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center gap-4 z-20">
                            <div className="w-12 h-12 border border-neutral-800 border-t-lime-400 animate-spin" />
                            <span className="text-[10px] font-bold tracking-widest text-lime-400 animate-pulse">PROCESSING_BUFFER...</span>
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-auto custom-scrollbar relative z-20 container-snap min-w-0">
                            <pre ref={outputRef} className={`text-[8px] md:text-[10px] lg:text-[11px] leading-[1em] ${colorClasses[colorMode]} whitespace-pre font-light select-all inline-block min-w-full font-mono drop-shadow-[0_0_8px_currentColor]`}>
                                {output || `[ NO DATA LOADED IN BUFFER ]\n\n> PLEASE SELECT INPUT SOURCE\n> AWAITING IMAGE OR TEXT SIGNAL...`}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
