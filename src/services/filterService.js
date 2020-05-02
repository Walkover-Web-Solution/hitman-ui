export function filter(entity, filter, title) {
  let entityId = "";
  if (title === "groupPages" || title === "endpoints") {
    entityId = "groupId";
  }
  if (title === "versionPages" || title === "groups" || title === "versions") {
    entityId = "versionId";
  }
  this.filtered = {};
  let entityIds = Object.keys(entity);
  let entityNameIds = [];
  let entityNames = [];
  for (let i = 0; i < entityIds.length; i++) {
    let name = "";
    if (title === "versions") {
      name = entity[entityIds[i]].number;
    } else {
      name = entity[entityIds[i]].name;
    }
    entityNameIds.push({ name: name, id: entityIds[i] });
    entityNames.push(name);
  }
  let finalEntityNames = entityNames.filter((name) => {
    return name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
  });

  let finalEntityIds = [];
  let uniqueIds = {};
  for (let i = 0; i < finalEntityNames.length; i++) {
    for (let j = 0; j < Object.keys(entityNameIds).length; j++) {
      if (
        finalEntityNames[i] === entityNameIds[j].name &&
        !uniqueIds[entityNameIds[j].id]
      ) {
        finalEntityIds.push(entityNameIds[j].id);
        uniqueIds[entityNameIds[j].id] = true;
        break;
      }
    }
  }
  if (title === "versions") {
    return finalEntityIds;
  }
  for (let i = 0; i < finalEntityIds.length; i++) {
    this.filtered[finalEntityIds[i]] = entity[finalEntityIds[i]];
  }
  let ids = [];
  if (Object.keys(this.filtered).length !== 0) {
    for (let i = 0; i < Object.keys(this.filtered).length; i++) {
      ids.push(this.filtered[finalEntityIds[i]][entityId]);
    }
  }
  if (
    title === "versionPages" ||
    title === "groupPages" ||
    title === "endpoints"
  ) {
    let idsAndFilteredEntity = [];
    idsAndFilteredEntity[0] = this.filtered;
    idsAndFilteredEntity[1] = ids;
    return idsAndFilteredEntity;
  }
  return ids;
}

export function jsonConcat(o1, o2) {
  for (var key in o2) {
    o1[key] = o2[key];
  }
  return o1;
}

export default {
  filter,
  jsonConcat,
};
