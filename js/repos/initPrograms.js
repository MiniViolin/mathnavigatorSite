'use strict';
import {
  forEach
} from 'lodash';
import jsons from './json/*.json';

export var locationMap = {};
export var preReqMap = {};
export var programMap = {};
export var classMapByKey = {};
export var classMapByProgramId = {};
export var classMapBySemesterId = {};
export var sessionMap = {};
export var announceList = [];
export var semesterMap = {};
export var semesterIds = [];

function init() {
  console.log('Initializing Programs...');
  locationMap = initLocations(jsons.locations);
  programMap = initPrograms(jsons.programs);

  const classes = jsons.classes;
  classMapByKey = initClassesByKey(classes);
  classMapByProgramId = initClassesByProgramId(classes);
  classMapBySemesterId = initClassesBySemesterId(classes);

  sessionMap = initSessions(jsons.sessions);
  preReqMap = initPreReqs(jsons.prereqs);
  announceList = initAnnounce(jsons.announcements);

  const semesters = jsons.semesters;
  semesterMap = initSemesterMap(semesters);
  semesterIds = initSemesterIds(semesters);
  console.log('Programs done initializing.');
}

function initLocations(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.locationId;
    map[id] = obj;
  });
  return map;
}

function initPrograms(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.programId;
    map[id] = obj;
  });
  return map;
}

function initClassesByKey(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.key;
    map[id] = filterClassObj(obj);
  });
  return map;
}

function initClassesByProgramId(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.programId;
    obj = filterClassObj(obj);
    if (!map[id] || map[id].length == 0) {
      map[id] = [obj];
    } else {
      map[id].push(obj);
    }
  });
  return map;
}

function initClassesBySemesterId(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.semesterId;
    obj = filterClassObj(obj);
    if (!map[id] || map[id].length == 0) {
      map[id] = [obj];
    } else {
      map[id].push(obj);
    }
  });
  return map;
}

function initSessions(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.classKey;
    if (id == "_") { return; }

    obj.canceled = convertStrToBool(obj.canceled);
    if (map[id] && map[id].length > 0) {
      map[id].push(obj);
    } else {
      map[id] = [obj];
    }
  });
  return map;
}

function initPreReqs(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.programId;
    obj.requiredProgramIds = convertStringArray(obj.requiredProgramIds);
    map[id] = obj;
  });
  return map;
}

function initAnnounce(arr) {
  var list = [];
  forEach(arr, function(obj) {
    obj.important = convertStrToBool(obj.important);
    obj.classKeys = convertStringArray(obj.classKeys);
    list.push(obj);
  });
  return list.reverse(); // Newest post to oldest
}

function initSemesterMap(arr) {
  var map = {};
  forEach(arr, function(obj) {
    var id = obj.semesterId;
    map[id] = obj;
  });
  return map;
}

function initSemesterIds(arr) {
  var list = [];
  forEach(arr, function(obj) {
    list.push(obj.semesterId);
  });
  return list;
}

/*
 * Helper functions
 */
 function filterClassObj(obj) {
   if (!obj.filtered) {
     obj.isAvailable = convertStrToBool(obj.isAvailable);
     obj.times = convertStringArray(obj.times);
     obj.allYear = convertStrToBool(obj.allYear);
     obj.filtered = true;
   }
   return obj;
 }

function convertStrToBool(str) {
  var isBool = (typeof str == 'boolean');
  var isString = (typeof str == 'string');

  if (isBool) {
    return str;
  } else if (isString && str.toLowerCase() === "true") {
    return true;
  } else {
    return false;
  }
}

function convertStringArray(str) {
  if (!str || (typeof str != 'string')) {
    return [];
  }

  // We assume the following format:
  // "[a, b, c]"
  var newStr = str.slice(0);
  var newStr = newStr.substring(1, newStr.length - 1);
  var arr = newStr.split(", ");
  return arr;
}

init();
