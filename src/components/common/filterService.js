export function filter(entity, filter, title) {
  let entityId = "";
  if (title === "groupPages" || title === "endpoints") {
    entityId = "groupId";
  }
  if (title === "versionPages") {
    entityId = "versionId";
  }
  console.log(entity, filter);
  this.filtered = {};
  let entityIds = Object.keys(entity);
  let entityNameIds = [];
  let entityNames = [];
  for (let i = 0; i < entityIds.length; i++) {
    const { name } = entity[entityIds[i]];
    entityNameIds.push({ name: name, id: entityIds[i] });
    entityNames.push(name);
  }
  console.log("entityNames", entityNames);
  let finalEntityNames = entityNames.filter((name) => {
    return name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
  });
  console.log("finalEntityNames", finalEntityNames);

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
  for (let i = 0; i < finalEntityIds.length; i++) {
    this.filtered[finalEntityIds[i]] = entity[finalEntityIds[i]];
  }
  console.log("this.filtered", this.filtered);
  let Ids = [];
  if (Object.keys(this.filtered).length !== 0) {
    for (let i = 0; i < Object.keys(this.filtered).length; i++) {
      Ids.push(this.filtered[finalEntityIds[i]][entityId]);
    }
  }
  console.log(Ids);
  return Ids;
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
