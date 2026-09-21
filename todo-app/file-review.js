export async function unzipEntries(buffer) {
      const bytes = new Uint8Array(buffer);
      const view = new DataView(buffer);
      let eocd = -1;
      for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index -= 1) {
        if (view.getUint32(index, true) === 0x06054b50) { eocd = index; break; }
      }
      if (eocd < 0) throw new Error("This file is not a readable ZIP-based office file.");
      const total = view.getUint16(eocd + 10, true);
      let offset = view.getUint32(eocd + 16, true);
      const entries = {};
      const decoder = new TextDecoder();
      for (let index = 0; index < total; index += 1) {
        if (view.getUint32(offset, true) !== 0x02014b50) break;
        const method = view.getUint16(offset + 10, true);
        const compressedSize = view.getUint32(offset + 20, true);
        const nameLength = view.getUint16(offset + 28, true);
        const extraLength = view.getUint16(offset + 30, true);
        const commentLength = view.getUint16(offset + 32, true);
        const localOffset = view.getUint32(offset + 42, true);
        const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
        const localNameLength = view.getUint16(localOffset + 26, true);
        const localExtraLength = view.getUint16(localOffset + 28, true);
        const start = localOffset + 30 + localNameLength + localExtraLength;
        const compressed = bytes.slice(start, start + compressedSize);
        let data = compressed;
        if (method === 8) {
          const stream = new DecompressionStream("deflate-raw");
          data = new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(stream)).arrayBuffer());
        } else if (method !== 0) {
          throw new Error("This compression format is not supported by this browser.");
        }
        entries[name] = decoder.decode(data);
        offset += 46 + nameLength + extraLength + commentLength;
      }
      return entries;
    }

export async function extractFileText(file) {
      const extension = file.name.toLowerCase().split(".").pop();
      if (["txt", "md", "csv", "json"].includes(extension)) return file.text();
      if (!["docx", "xlsx", "pptx"].includes(extension)) return "";
      const entries = await unzipEntries(await file.arrayBuffer());
      const parser = new DOMParser();
      const xmlText = (name) => entries[name] ? parser.parseFromString(entries[name], "application/xml").documentElement.textContent : "";
      if (extension === "docx") return xmlText("word/document.xml");
      if (extension === "pptx") {
        return Object.keys(entries).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort().map(xmlText).join(" ");
      }
      const shared = entries["xl/sharedStrings.xml"] ? Array.from(parser.parseFromString(entries["xl/sharedStrings.xml"], "application/xml").querySelectorAll("si")).map((node) => node.textContent) : [];
      return Object.keys(entries).filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name)).sort().map((name) => {
        const sheet = parser.parseFromString(entries[name], "application/xml");
        return Array.from(sheet.querySelectorAll("c")).map((cell) => cell.getAttribute("t") === "s" ? shared[Number(cell.querySelector("v")?.textContent)] || "" : cell.querySelector("v")?.textContent || "").join(" ");
      }).join(" ");
    }

export function analyzeFile(file, text) {
      const extension = file.name.toLowerCase().split(".").pop();
      const label = file.name.replace(/\.[^.]+$/, "");
      const normalized = text.replace(/\s+/g, " ").trim();
      const findings = [{
        issue: `The fileâ€™s purpose may not be immediately clear.`,
        fix: `Add a short title, summary, and one-sentence desired outcome at the beginning.`,
        task: `Clarify the purpose and desired outcome of "${label}"`
      }];
      if (!normalized || normalized.length < 120) findings.push({
        issue: `There is very little readable content to work from.`,
        fix: `Add the missing context, supporting details, and an example so someone new can understand it.`,
        task: `Add context and detail to "${label}"`
      });
      if (/\b(todo|tbd|fixme|follow[- ]?up|action item)\b/i.test(normalized)) findings.push({
        issue: `The file contains unresolved TODOs, TBDs, or action items.`,
        fix: `Turn each item into an owner, a specific next step, and a due date; remove the marker when resolved.`,
        task: `Resolve and assign the open action items in "${label}"`
      });
      if (["csv", "xlsx", "xls"].includes(extension)) {
        findings.push({
          issue: `The spreadsheet may contain data-quality risks.`,
          fix: `Check for blank cells, duplicate rows, inconsistent formats, and values outside the expected range.`,
          task: `Check "${label}" for missing values, duplicates, and inconsistent formats`
        }, {
          issue: `The dataâ€™s meaning and origin may be hard to verify.`,
          fix: `Use descriptive headers, add units, freeze the header row, and document the source and refresh date.`,
          task: `Document the headers, units, source, and refresh date for "${label}"`
        });
      } else if (["pptx", "ppt"].includes(extension)) {
        findings.push({
          issue: `Slides may compete for attention or contain too much text.`,
          fix: `Give each slide one message, shorten paragraphs into bullets, and increase contrast and font size.`,
          task: `Simplify slide messages and improve readability in "${label}"`
        }, {
          issue: `The presentation may not end with a clear decision or action.`,
          fix: `Add a final summary slide with the recommendation, owner, deadline, and next step.`,
          task: `Add a conclusion and next step to "${label}"`
        });
      } else {
        findings.push({
          issue: `The structure and reading flow may be difficult to follow.`,
          fix: `Use descriptive headings, group related ideas, and move the most important conclusion near the top.`,
          task: `Improve the headings and structure of "${label}"`
        }, {
          issue: `The content may contain inconsistent wording or outdated details.`,
          fix: `Proofread it, standardize terminology, verify dates and links, and remove duplicated information.`,
          task: `Proofread and verify the details in "${label}"`
        });
      }
      return findings;
    }
