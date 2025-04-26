import { getString } from "../utils/locale";
import { config } from "../../package.json";

export class Preferences {
  static registerPreferences() {
    Zotero.PreferencePanes.register({
      pluginID: config.addonID,
      src: rootURI + "content/preferences.xhtml",
      label: getString("prefs-title"),
      image: `chrome://${config.addonRef}/content/icons/favicon.svg`,
    });
  }
}
