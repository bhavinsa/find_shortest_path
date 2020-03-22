document.getElementById('findPath').addEventListener('click', startProcess);

function startProcess() {
  try {
    var gridSize = document.getElementById('gridSize').value;
    var cubes = JSON.parse(document.getElementById('inputData').value);
    var source = JSON.parse(document.getElementById('source').value);
    var destination = JSON.parse(document.getElementById('destination').value);
    var json = cubes.map(function(x) {
      return {
        s_id: x[0],
        t_id: x[1]
      };
    });

    // Create a gridSizexgridSize grid
    // Represent the grid as a 2-dimensional array
    var grid = [];
    for (var i = 0; i < gridSize; i++) {
      grid[i] = [];
      for (var j = 0; j < gridSize; j++) {
        grid[i][j] = 'Empty';
      }
    }

    // Add Obstacle here.
    json.filter(function(item) {
      grid[item.s_id][item.t_id] = 'Obstacle';
    });

    // Think of the first index as "distance from the top row"
    // Think of the second index as "distance from the left-most column"

    // This is how we would represent the grid with obstacles above
    grid[source[0]][source[1]] = 'Start';
    grid[destination[0]][destination[1]] = 'Goal';
    var result = findShortestPath([source[0], source[1]], grid);

    var resultInArr = [];

    result.gridObj.forEach(function(object) {
      resultInArr.push([object.x, object.y]);
    });

    document.getElementById('result').innerHTML =
      '<pre> ' + JSON.stringify(resultInArr, null, 2) + ' </pre>';
  } catch (error) {
    document.getElementById('result').innerHTML =
      '<pre> Error : ' + error + ' </pre>';
    console.log(error);
  }
}

// Start location will be in the following format:
// [distanceFromTop, distanceFromLeft]
var findShortestPath = function(startCoordinates, grid) {
  var distanceFromTop = startCoordinates[0];
  var distanceFromLeft = startCoordinates[1];

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  var location = {
    distanceFromTop: distanceFromTop,
    distanceFromLeft: distanceFromLeft,
    path: [],
    status: 'Start',
    grid: [],
    gridObj: []
  };

  // Initialize the queue with the start location already inside
  var queue = [location];

  // Loop through the grid searching for the goal
  while (queue.length > 0) {
    // Take the first location off the queue
    var currentLocation = queue.shift();

    // Explore North
    var newLocation = exploreInDirection(currentLocation, 'North', grid);
    if (newLocation.status === 'Goal') {
      return newLocation;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore East
    var newLocation = exploreInDirection(currentLocation, 'East', grid);
    if (newLocation.status === 'Goal') {
      return newLocation;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore South
    var newLocation = exploreInDirection(currentLocation, 'South', grid);
    if (newLocation.status === 'Goal') {
      return newLocation;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore West
    var newLocation = exploreInDirection(currentLocation, 'West', grid);
    if (newLocation.status === 'Goal') {
      return newLocation;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }
  }

  // No valid path found
  return false;
};

// This function will check a location's status
// (a location is "valid" if it is on the grid, is not an "obstacle",
// and has not yet been visited by our algorithm)
// Returns "Valid", "Invalid", "Blocked", or "Goal"
var locationStatus = function(location, grid) {
  var gridSize = grid.length;
  var dft = location.distanceFromTop;
  var dfl = location.distanceFromLeft;

  if (
    location.distanceFromLeft < 0 ||
    location.distanceFromLeft >= gridSize ||
    location.distanceFromTop < 0 ||
    location.distanceFromTop >= gridSize
  ) {
    // location is not on the grid--return false
    return 'Invalid';
  } else if (grid[dft][dfl] === 'Goal') {
    return 'Goal';
  } else if (grid[dft][dfl] !== 'Empty') {
    // location is either an obstacle or has been visited
    return 'Blocked';
  } else {
    return 'Valid';
  }
};
var gridObj = [];
// Explores the grid from the given location in the given
// direction
var exploreInDirection = function(currentLocation, direction, grid) {
  var newPath = currentLocation.path.slice();
  newPath.push(direction);

  var dft = currentLocation.distanceFromTop;
  var dfl = currentLocation.distanceFromLeft;

  var newXY = currentLocation.gridObj.slice();
  newXY.push({
    x: dft,
    y: dfl
  });

  if (direction === 'North') {
    dft -= 1;
  } else if (direction === 'East') {
    dfl += 1;
  } else if (direction === 'South') {
    dft += 1;
  } else if (direction === 'West') {
    dfl -= 1;
  }

  var newLocation = {
    distanceFromTop: dft,
    distanceFromLeft: dfl,
    path: newPath,
    status: 'Unknown',
    grid: grid,
    gridObj: newXY
  };
  newLocation.status = locationStatus(newLocation, grid);

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === 'Valid') {
    grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
  }

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === 'Goal') {
    var newXY = currentLocation.gridObj.slice();
    newXY.push({
      x: newLocation.distanceFromTop,
      y: newLocation.distanceFromLeft
    });
    newLocation.gridObj = newXY;
  }

  return newLocation;
};
