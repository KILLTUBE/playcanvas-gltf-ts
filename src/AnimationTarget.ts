export enum TargetPath {
	LocalPosition   = 0,
	LocalScale      = 1,
	LocalRotation   = 2,
	LocalEulerAngles= 3,
	Weights         = 4,
};

// *===============================================================================================================
// * class AnimationTarget: organize target into an object, this allows 1-Curve-Multiple-Targets
// *                        one AnimationCurve has a [] collection of AnimationTargets
// *                        one AnimationClip has a {} dictionary of AnimationTargets, keyname matches curvename
// *===============================================================================================================

export type AnimationTargetOutput = {[targetNodeName: string]: AnimationTarget};

export class AnimationTarget {
    vScale?: pc.Vec3 | number[];
    targetNode: pc.GraphNode;
    targetPath: TargetPath;
    targetProp: string;

	constructor(targetNode: pc.GraphNode, targetPath?: TargetPath, targetProp?: string) {
		this.targetNode = targetNode;
		this.targetPath = targetPath;
		this.targetProp = targetProp;
	}

	toString(){
		var str = "";
		if (this.targetNode)
			str += this.targetNode.name;
		if (this.targetPath)
			str += ("_" + this.targetPath);
		if (this.targetProp)
			str += ("_" + this.targetProp);
		return str;
	}

	copy(target: AnimationTarget) {
		if (target) {
			this.targetNode = target.targetNode;
			this.targetPath = target.targetPath;
			this.targetProp = target.targetProp;
		}
		return this;
	}

	clone() {
		var cloned = new AnimationTarget(this.targetNode, this.targetPath, this.targetProp);
		return cloned;
	}

	/**
	 * @summary based on current target[path]'s value, blend in value by p
	 */

	blendToTarget(value: pc.Vec3 | number, p: number) {
		if ((typeof value === "undefined") || p > 1 || p <= 0)// p===0 remain prev
			return;

		// target needs scaling for retargetting
		if (this.targetPath === TargetPath.LocalPosition && (this.vScale instanceof pc.Vec3)) {
			if (value instanceof pc.Vec3) {
				value.mul(this.vScale);
				//value.x *= this.vScale.x;
				//value.y *= this.vScale.y;
				//value.z *= this.vScale.z;
			} else if ((typeof value === "number") && (typeof this.vScale[this.targetProp] === "number")) {
				value *= this.vScale[this.targetProp];
			}
		}

		if (p === 1) {
			this.updateToTarget(value);
			return;
		}

		// p*cur + (1-p)*prev
		if (this.targetNode) {
			var blendValue;

			switch (this.targetPath) {
				case TargetPath.LocalPosition: {
					if (this.targetProp && this.targetProp in this.targetNode.localPosition) {
						blendValue = AnimationKeyable_linearBlendValue(this.targetNode.localPosition[this.targetProp], value, p);
						this.targetNode.localPosition[this.targetProp] = blendValue;
					} else {
						blendValue = AnimationKeyable_linearBlendValue(this.targetNode.localPosition, value, p);
						this.targetNode.localPosition = blendValue;
					}
					break;
				}
				case TargetPath.LocalScale: {
					if (this.targetProp && this.targetProp in this.targetNode.localScale) {
						blendValue = AnimationKeyable_linearBlendValue(this.targetNode.localScale[this.targetProp], value, p);
						this.targetNode.localScale[this.targetProp] = blendValue;
					} else {
						blendValue = AnimationKeyable_linearBlendValue(this.targetNode.localScale, value, p);
						this.targetNode.localScale = blendValue;
					}
					break;
				}
				case TargetPath.LocalRotation: {
					if (this.targetProp && this.targetProp in this.targetNode.localRotation) {
						blendValue = AnimationKeyable_linearBlendValue(this.targetNode.localRotation[this.targetProp], value, p);
						this.targetNode.localRotation[this.targetProp] = blendValue;
					} else {
						blendValue = AnimationKeyable_linearBlendValue(this.targetNode.localRotation, value, p);
						this.targetNode.localRotation = blendValue;
					}
					break;
				}
				case TargetPath.LocalEulerAngles: {
					var vec3 = new pc.Vec3();
					if (this.targetProp === "x" || this.targetProp === "y" || this.targetProp === "z")
						vec3[this.targetProp] = blendValue;
					else
						vec3 = blendValue;
					this.targetNode.setLocalEulerAngles(vec3);
					break;
				}
			}		

			// execute update target
			if (typeof this.targetNode._dirtifyLocal === 'function') {
				this.targetNode._dirtifyLocal();
			}
		}

		/* /special wrapping for morph weights
		if (this.targetNode && this.targetPath === TargetPath.Weights && this.targetNode.model)
		{
			var meshInstances = this.targetNode.model.meshInstances;
			for (var m = 0; m < meshInstances.length; m++)
			{
				var morphInstance = meshInstances[m].morphInstance;
				if (!morphInstance) continue;
				morphInstance.setWeight(this.targetProp, keyable.value);
			}
		}*/
	}

	updateToTarget(value: pc.Vec3 | number) {
		if ((typeof value === "undefined"))
			return;

		// target needs scaling for retargetting
		if (this.targetPath === TargetPath.LocalPosition && (this.vScale instanceof pc.Vec3)) {
			if (value instanceof pc.Vec3) {
				value.mul(this.vScale);
				//value.x *= this.vScale.x;
				//value.y *= this.vScale.y;
				//value.z *= this.vScale.z;
			} else if ((typeof value === "number") && (typeof this.vScale[this.targetProp] === "number")) {
				value *= this.vScale[this.targetProp];
			}
		}

		if (typeof this.targetNode === "undefined")
			return;

		switch (this.targetPath) {

			case TargetPath.LocalPosition: {
				if (this.targetProp && this.targetProp in this.targetNode.localPosition) {
					this.targetNode.localPosition[this.targetProp] = value;
				} else {
					this.targetNode.localPosition = value;
				}
				// execute update target
				if (typeof this.targetNode._dirtifyLocal === 'function') {
					this.targetNode._dirtifyLocal();
				}
				break;
			}

			case TargetPath.LocalScale: {
				if (this.targetProp && this.targetProp in this.targetNode.localScale) {
					this.targetNode.localScale[this.targetProp] = value;
				} else {
					this.targetNode.localScale = value;
				}
				// execute update target
				if (typeof this.targetNode._dirtifyLocal === 'function') {
					this.targetNode._dirtifyLocal();
				}
				break;
			}

			case TargetPath.LocalRotation: {
				if (this.targetProp && this.targetProp in this.targetNode.localRotation) {
					this.targetNode.localRotation[this.targetProp] = value;
				} else {
					this.targetNode.localRotation = value;
				}
				// execute update target
				if (typeof this.targetNode._dirtifyLocal === 'function') {
					this.targetNode._dirtifyLocal();
				}
				break;
			}

			case TargetPath.LocalEulerAngles: {
				var vec3 = new pc.Vec3();
				if (this.targetProp === "x" || this.targetProp === "y" || this.targetProp === "z")
					vec3[this.targetProp] = value;
				else
					vec3 = value;
				this.targetNode.setLocalEulerAngles(vec3);
				// execute update target
				if (typeof this.targetNode._dirtifyLocal === 'function') {
					this.targetNode._dirtifyLocal();
				}
				break;
			}
			
			case TargetPath.Weights: {
				if (this.targetNode.model) {
					var meshInstances = this.targetNode.model.meshInstances;
					for (var m = 0; m < meshInstances.length; m++) {
						var morphInstance = meshInstances[m].morphInstance;
						if (!morphInstance) continue;
						morphInstance.setWeight(this.targetProp, value);
					}
				}
			}

		} // switch (this.targetPath)
	}



	static constructTargetNodes(root: pc.GraphNode, vec3Scale: pc.Vec3, output: AnimationTargetOutput) {
		if (!root)
			return;

		var vScale = vec3Scale || new pc.Vec3(1, 1, 1);
		var rootTargetNode = new AnimationTarget(root);
		if (root.localScale)
			rootTargetNode.vScale = new pc.Vec3(root.localScale.x * vScale.x, root.localScale.y * vScale.y, root.localScale.z * vScale.z);

		output[rootTargetNode.targetNode.name] = rootTargetNode;
		for (var i = 0; i < root.children.length; i ++) {
			AnimationTarget.constructTargetNodes(root.children[i], rootTargetNode.vScale, output);
		}
	}

	static getLocalScale(node: pc.GraphNode): pc.Vec3 {
		if (!node)
			return;

		var vScale = new pc.Vec3(1, 1, 1);
		var curNode = node;
		while (curNode) {
			if (curNode.localScale) {
				vScale.x *= curNode.localScale.x;
				vScale.y *= curNode.localScale.y;
				vScale.z *= curNode.localScale.z;
			}
			curNode = curNode.parent;
		}
		return vScale;
	}
}
