import { rootcloud } from "./utils/store";
App({
  onLaunch() {
    rootcloud.init();
  }
});