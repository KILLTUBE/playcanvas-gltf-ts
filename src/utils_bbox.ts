// flatten a hierarchy of nodes
export function flatten(node: pc.GraphNode) {
  const result: Array<pc.GraphNode> = [];
  node.forEach(function (n: pc.GraphNode) {
    result.push(n);
  });
  return result;
}

// get the set of unique values from the array
export function distinct(array: Array<any>) {
  const result = [];
  for (let i = 0; i < array.length; ++i) {
    if (result.indexOf(array[i]) === -1) {
      result.push(array[i]);
    }
  }
  return result;
}

// calculate the bounding box of the given mesh
export function calcMeshBoundingBox(meshInstances: Array<pc.MeshInstance>) {
  const bbox = new pc.BoundingBox();
  for (let i = 0; i < meshInstances.length; ++i) {
    if (i === 0) {
      bbox.copy(meshInstances[i].aabb);
    } else {
      bbox.add(meshInstances[i].aabb);
    }
  }
  return bbox;
}

// calculate the bounding box of the graph-node hierarchy
export function calcHierBoundingBox(rootNode: pc.Entity) {
  const position = rootNode.getPosition();
  let min_x = position.x;
  let min_y = position.y;
  let min_z = position.z;
  let max_x = position.x;
  let max_y = position.y;
  let max_z = position.z;

  const recurse = function (node: pc.GraphNode) {
    const p = node.getPosition();
    if (p.x < min_x) min_x = p.x; else if (p.x > max_x) max_x = p.x;
    if (p.y < min_y) min_y = p.y; else if (p.y > max_y) max_y = p.y;
    if (p.z < min_z) min_z = p.z; else if (p.z > max_z) max_z = p.z;
    for (let i = 0; i < node.children.length; ++i) {
      recurse(node.children[i]);
    }
  };
  recurse(rootNode);

  const result = new pc.BoundingBox();
  result.setMinMax(new pc.Vec3(min_x, min_y, min_z), new pc.Vec3(max_x, max_y, max_z));
  return result;
}

// calculate the intersection of the two bounding boxes
export function calcBoundingBoxIntersection(bbox1: pc.BoundingBox, bbox2: pc.BoundingBox) {
  // bounds don't intersect
  if (!bbox1.intersects(bbox2)) {
    return null;
  }
  const min1 = bbox1.getMin();
  const max1 = bbox1.getMax();
  const min2 = bbox2.getMin();
  const max2 = bbox2.getMax();
  const result = new pc.BoundingBox();
  result.setMinMax(
    new pc.Vec3(Math.max(min1.x, min2.x), Math.max(min1.y, min2.y), Math.max(min1.z, min2.z)),
    new pc.Vec3(Math.min(max1.x, max2.x), Math.min(max1.y, max2.y), Math.min(max1.z, max2.z))
  );
  return result;
}
