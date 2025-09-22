import { MindmapNode, Connection } from "../types/local";

export interface ExportOptions {
  format?: "json" | "png" | "svg" | "pdf";
  quality?: number;
  backgroundColor?: string;
  includeBackground?: boolean;
  scale?: number;
}

// Export mind map as JSON
export const exportAsJSON = (
  nodes: { [id: string]: MindmapNode },
  connections: { [id: string]: Connection },
  title: string,
  description?: string
): string => {
  const exportData = {
    metadata: {
      title,
      description,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      format: "mindmap-json",
    },
    nodes: Object.values(nodes),
    connections: Object.values(connections),
  };

  return JSON.stringify(exportData, null, 2);
};

// Download a file with given content
export const downloadFile = (
  content: string | Blob,
  filename: string,
  mimeType: string
) => {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export mind map stage as PNG
export const exportAsPNG = async (
  stage: any, // Konva Stage
  options: ExportOptions = {}
): Promise<Blob> => {
  const {
    quality = 1,
    backgroundColor = "#ffffff",
    includeBackground = true,
    scale = 1,
  } = options;

  return new Promise((resolve) => {
    const canvas = stage.toCanvas({
      pixelRatio: scale,
      quality: quality,
    });

    if (includeBackground && backgroundColor) {
      // Create a new canvas with background
      const newCanvas = document.createElement("canvas");
      const ctx = newCanvas.getContext("2d")!;

      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

      // Draw the mind map on top
      ctx.drawImage(canvas, 0, 0);

      newCanvas.toBlob(
        (blob) => {
          resolve(blob!);
        },
        "image/png",
        quality
      );
    } else {
      canvas.toBlob(
        (blob) => {
          resolve(blob!);
        },
        "image/png",
        quality
      );
    }
  });
};

// Export mind map stage as SVG
export const exportAsSVG = (stage: any): string => {
  // Get stage bounds
  const box = stage.getClientRect();

  // Create SVG header
  let svg = `<svg width="${box.width}" height="${box.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;

  // Add background
  svg += `<rect width="100%" height="100%" fill="white"/>`;

  // Add each layer's content
  stage.children.forEach((layer: any) => {
    svg += layerToSVG(layer);
  });

  svg += "</svg>";

  return svg;
};

// Convert Konva layer to SVG (simplified version)
const layerToSVG = (layer: any): string => {
  let svg = "<g>";

  layer.children.forEach((child: any) => {
    svg += nodeToSVG(child);
  });

  svg += "</g>";
  return svg;
};

// Convert Konva node to SVG (simplified)
const nodeToSVG = (node: any): string => {
  const attrs = node.attrs;

  switch (node.className) {
    case "Group":
      let groupSvg = "<g";
      if (attrs.x) groupSvg += ` transform="translate(${attrs.x},${attrs.y})"`;
      groupSvg += ">";

      node.children.forEach((child: any) => {
        groupSvg += nodeToSVG(child);
      });

      groupSvg += "</g>";
      return groupSvg;

    case "Rect":
      return `<rect x="${attrs.x || 0}" y="${attrs.y || 0}" width="${
        attrs.width
      }" height="${attrs.height}" 
              fill="${attrs.fill || "white"}" stroke="${
        attrs.stroke || "none"
      }" 
              stroke-width="${attrs.strokeWidth || 0}" rx="${
        attrs.cornerRadius || 0
      }"/>`;

    case "Circle":
      if (attrs.radiusX && attrs.radiusY) {
        // Ellipse
        return `<ellipse cx="${attrs.x}" cy="${attrs.y}" rx="${
          attrs.radiusX
        }" ry="${attrs.radiusY}" 
                fill="${attrs.fill || "white"}" stroke="${
          attrs.stroke || "none"
        }" 
                stroke-width="${attrs.strokeWidth || 0}"/>`;
      } else {
        // Circle
        return `<circle cx="${attrs.x}" cy="${attrs.y}" r="${attrs.radius}" 
                fill="${attrs.fill || "white"}" stroke="${
          attrs.stroke || "none"
        }" 
                stroke-width="${attrs.strokeWidth || 0}"/>`;
      }

    case "Text":
      return `<text x="${attrs.x}" y="${attrs.y + (attrs.fontSize || 16)}" 
              font-family="${attrs.fontFamily || "Arial"}" font-size="${
        attrs.fontSize || 16
      }" 
              fill="${attrs.fill || "black"}" text-anchor="${getTextAnchor(
        attrs.align
      )}">${attrs.text || ""}</text>`;

    case "Line":
      if (attrs.points && attrs.points.length >= 4) {
        const points = attrs.points;
        let path = `M ${points[0]} ${points[1]}`;

        for (let i = 2; i < points.length; i += 2) {
          path += ` L ${points[i]} ${points[i + 1]}`;
        }

        return `<path d="${path}" stroke="${attrs.stroke || "black"}" 
                stroke-width="${attrs.strokeWidth || 1}" fill="none" 
                stroke-dasharray="${
                  attrs.dash ? attrs.dash.join(",") : "none"
                }"/>`;
      }
      return "";

    default:
      return "";
  }
};

const getTextAnchor = (align: string): string => {
  switch (align) {
    case "center":
      return "middle";
    case "right":
      return "end";
    default:
      return "start";
  }
};

// Export as PDF (requires additional library like jsPDF)
export const exportAsPDF = async (
  stage: any,
  options: ExportOptions = {}
): Promise<Blob> => {
  // For now, convert to PNG and then to PDF
  // In a full implementation, you'd use jsPDF library
  const pngBlob = await exportAsPNG(stage, options);

  // This is a placeholder - in reality you'd use jsPDF:
  // const pdf = new jsPDF();
  // const imgData = await blobToDataURL(pngBlob);
  // pdf.addImage(imgData, 'PNG', 0, 0);
  // return pdf.output('blob');

  return pngBlob; // For now, return PNG
};

// Utility to convert blob to data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

// Import mind map from JSON
export const importFromJSON = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);

    // Validate the format
    if (!data.metadata || data.metadata.format !== "mindmap-json") {
      throw new Error("Invalid mind map format");
    }

    if (!data.nodes || !data.connections) {
      throw new Error("Missing nodes or connections data");
    }

    return {
      metadata: data.metadata,
      nodes: data.nodes,
      connections: data.connections,
    };
  } catch (error) {
    throw new Error(`Failed to import mind map: ${error.message}`);
  }
};

// Calculate bounds of all nodes for export
export const calculateMindmapBounds = (nodes: {
  [id: string]: MindmapNode;
}) => {
  const nodeArray = Object.values(nodes);

  if (nodeArray.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodeArray.forEach((node) => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });

  // Add padding
  const padding = 50;

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + 2 * padding,
    height: maxY - minY + 2 * padding,
  };
};
