import { Brush, Eraser, Maximize2, Palette, PenLine, Smile } from "lucide-react";

// One entry per tool. The studio page is generated from this list, so adding
// a tool means adding an entry here and a matching route in the backend.
const tools = [
  {
    id: "style-transfer",
    path: "/style-transfer",
    name: "Style transfer",
    icon: Brush,
    blurb: "Repaint a photo in the style of any artwork.",
    endpoint: "/stylize",
    inputs: [
      { name: "content", label: "Your photo" },
      { name: "style", label: "Style image", hint: "A painting, pattern or texture to borrow the look from" },
    ],
    action: "Apply style",
    working: "Painting your photo",
    note: "The first run loads the model, which can take a minute.",
  },
  {
    id: "cartoonize",
    path: "/cartoonize",
    name: "Cartoonize",
    icon: Smile,
    blurb: "Flat colours and bold outlines, or a soft anime look.",
    endpoint: "/cartoonize",
    inputs: [{ name: "content", label: "Your photo" }],
    options: [
      {
        name: "style",
        label: "Look",
        choices: [
          { value: "classic", label: "Classic", hint: "Bold outlines, instant" },
          { value: "anime", label: "Anime", hint: "AnimeGANv2, a few seconds" },
        ],
      },
    ],
    action: "Cartoonize",
    working: "Drawing your cartoon",
  },
  {
    id: "remove-background",
    path: "/remove-background",
    name: "Remove background",
    icon: Eraser,
    blurb: "Cut the subject out, or blur what's behind it.",
    endpoint: "/remove-background",
    inputs: [{ name: "content", label: "Your photo" }],
    options: [
      {
        name: "background",
        label: "Replace the background with",
        choices: [
          { value: "transparent", label: "Transparent" },
          { value: "white", label: "White" },
          { value: "black", label: "Black" },
          { value: "blur", label: "Blur" },
        ],
      },
    ],
    action: "Remove background",
    working: "Cutting out the subject",
    note: "The first run downloads a 176 MB model.",
  },
  {
    id: "upscale",
    path: "/upscale",
    name: "Upscale",
    icon: Maximize2,
    blurb: "Make a small image two or four times larger.",
    endpoint: "/upscale",
    inputs: [{ name: "content", label: "Your image" }],
    options: [
      {
        name: "scale",
        label: "Size",
        choices: [
          { value: "2", label: "2×" },
          { value: "4", label: "4×" },
        ],
      },
      {
        name: "quality",
        label: "Quality",
        choices: [
          { value: "fast", label: "Fast", hint: "About a second" },
          { value: "sharp", label: "Sharp", hint: "Up to a minute; inputs over 384 px are shrunk first" },
        ],
      },
    ],
    action: "Upscale",
    working: "Adding pixels",
  },
  {
    id: "sketch",
    path: "/sketch",
    name: "Sketch and paint",
    icon: PenLine,
    blurb: "Pencil drawing, coloured pencil or watercolour.",
    endpoint: "/sketch",
    inputs: [{ name: "content", label: "Your photo" }],
    options: [
      {
        name: "effect",
        label: "Medium",
        choices: [
          { value: "pencil", label: "Pencil" },
          { value: "color-pencil", label: "Coloured pencil" },
          { value: "watercolor", label: "Watercolour" },
        ],
      },
    ],
    action: "Draw it",
    working: "Sketching",
  },
  {
    id: "colorize",
    path: "/colorize",
    name: "Colorize",
    icon: Palette,
    blurb: "Add colour to a black-and-white photo.",
    endpoint: "/colorize",
    inputs: [{ name: "content", label: "Black-and-white photo" }],
    action: "Colorize",
    working: "Adding colour",
    note: "The first run downloads the model.",
  },
];

export default tools;
