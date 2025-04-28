import { getLocaleID, getString } from "./utils/locale";
import { getPref } from "./utils/prefs";

let sortedOnFirstRender = false;

function maySortActivaPane() {
  if (!getPref("sort-on-first-render")) return;
  if (sortedOnFirstRender) return;
  sortedOnFirstRender = true;
  // @ts-ignore Wrong Zotero typing
  Zotero.getActiveZoteroPane().itemsView.sort();
}

export function registerExtraColumn() {
  Zotero.ItemTreeManager.registerColumn({
    pluginID: addon.data.config.addonID,
    dataKey: "color-tag",
    label: getString("tag-column"),
    minWidth: 30,
    zoteroPersist: ["width", "hidden", "sortDirection"],
    flex: 0.2,
    dataProvider: (item: Zotero.Item, dataKey: string) => {
      const tagColors = Zotero.Tags.getColors(item.libraryID);
      let weight = 0;
      for (const { tag: tagName } of item.getTags()) {
        const tag = tagColors.get(tagName);
        if (tag === undefined) continue;
        // @ts-ignore Wrong Zotero typing
        weight += Math.pow(2, 7 - tag.position);
      }
      // Zotero forces the secondary column the same direction of the primary sort
      // We have to change the order of the tags in order to control secondary sorts
      if (getPref("secondary-ascending")) weight = (1 << 8) - weight;
      const dataString = weight.toString(2).padStart(8, "0");
      const colors = item
        .getTags() // @ts-ignore Wrong Zotero typing
        .map(({ tag: tagName }) => tagColors.get(tagName)?.color)
        .filter((x) => !!x);
      return dataString + "|" + JSON.stringify(colors);
    },
    renderCell(index, data, column, isFirstColumn, doc) {
      maySortActivaPane();
      const colors = JSON.parse(data.slice(data.indexOf("|") + 1)) as string[];
      const div = doc.createElement("span");
      for (const color of colors) {
        const span = doc.createElement("span");
        span.className = "colored tag-swatch";
        span.style.color = color;
        div.appendChild(span);
      }
      div.className = `cell colored-tag-swatches ${column.className}`;
      return div;
    },
  });
}
