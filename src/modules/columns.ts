import { getLocaleID, getString } from "../utils/locale";

export function catchError(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(`Error in ${target.name}.${String(propertyKey)}`, e);
      throw e;
    }
  };
  return descriptor;
}

export class TagColumn {
  @catchError
  static registerExtraColumn() {
    let sortedOnFirstRender = false;
    Zotero.ItemTreeManager.registerColumn({
      pluginID: addon.data.config.addonID,
      dataKey: "color-tag",
      label: "Tags",
      minWidth: 30,
      zoteroPersist: ["width", "hidden", "sortDirection"],
      dataProvider: (item: Zotero.Item, dataKey: string) => {
        const tagColors = Zotero.Tags.getColors(item.libraryID);
        let weight = 0;
        for (const { tag: tagName } of item.getTags()) {
          const tag = tagColors.get(tagName);
          if (tag === undefined) continue;
          // @ts-ignore
          weight += Math.pow(2, 7 - tag.position);
        }
        const dataString = weight.toString(2).padStart(8, "0");
        const colors = item
          .getTags() // @ts-ignore
          .map(({ tag: tagName }) => tagColors.get(tagName)?.color)
          .filter((x) => !!x);
        return dataString + "|" + JSON.stringify(colors)
      },
      renderCell(index, data, column, isFirstColumn, doc) {
        if (!sortedOnFirstRender) {
          sortedOnFirstRender = true;
          // @ts-ignore
          Zotero.getActiveZoteroPane().itemsView.sort();
        }
        const colors = JSON.parse(data.slice(9)) as string[];
        const div = doc.createElement("span");
        for (const color of colors) {
          const span = doc.createElement("span");
          span.className = "colored tag-swatch"
          span.style.color = color;
          div.appendChild(span);
        }
        div.className = `cell colored-tag-swatches ${column.className}`;
        return div;
      },
    });
  }
}
