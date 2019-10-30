import "./bundle_pcgltf";
import { Viewer, main } from "./Viewer";
import * as utils from "./utils";
import * as Timeline from "./Timeline";
import * as ShaderChunks from "./ShaderChunks";

//var viewer = new Viewer();

Object.assign(window, {
	Viewer,
	//viewer,
	main
})

Object.assign(window, utils);
Object.assign(window, Timeline);
Object.assign(window, ShaderChunks);
