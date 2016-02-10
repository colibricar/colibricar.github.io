var data = {
  categories: {
    1: {
      id: 1,
      name: "Diesel",
      rank: 1
    },
    2: {
      id: 2,
      name: "Familiale",
      rank: 2
    },
    3: {
      id: 3,
      name: "Cabriolet",
      rank: 3
    },
    4: {
      id: 4,
      name: "4x4",
      rank: 4
    }
  },
	cars: [
		{
			id: 1,
			name: "CH-111-11",
			categoryId: 1
		},
		{
		  id: 2,
		  name: "AB-222-22",
			categoryId: 2
		},
		{
		  id: 3,
		  name: "BD-333-33",
			categoryId: 3
		},
		{
		  id: 4,
		  name: "CF-444-44",
			categoryId: 1
		},
		{
		  id: 5,
		  name: "DG-555-55",
			categoryId: 2
		}
	],
	rentals: [
		{
			id: 1,
			carId: 1,
			start: isoDateIn(7, "days"),
			end: isoDateIn(14, "days"),
			categoryId: 1
		},
		{
		  id: 2,
		  carId: 2,
		  start: isoDateIn(0, "days"),
		  end: isoDateIn(5, "days"),
			categoryId: 2
		},
		{
		  id: 3,
		  carId: 2,
		  start: isoDateIn(7, "days"),
		  end: isoDateIn(12, "days"),
			categoryId: 2
		},
		{
		  id: 4,
		  carId: 1,
		  start: isoDateIn(15, "days"),
		  end: isoDateIn(19, "days"),
			categoryId: 1
		},
		{
		  id: 5,
		  carId: 3,
		  start: isoDateIn(2, "days"),
		  end: isoDateIn(6, "days"),
			categoryId: 3
		},
		{
		  id: 6,
		  carId: 4,
		  start: isoDateIn(7, "days"),
		  end: isoDateIn(12, "days"),
			categoryId: 1
		},
		{
		  id: 7,
		  carId: 2,
		  start: isoDateIn(13, "days"),
		  end: isoDateIn(19, "days"),
			categoryId: 2
		},
		{
		  id: 8,
		  carId: 1,
		  start: isoDateIn(0, "days"),
		  end: isoDateIn(6, "days"),
			categoryId: 1
		},
		{
		  id: 9,
		  carId: 4,
		  start: isoDateIn(36, "days"),
		  end: isoDateIn(45, "days"),
			categoryId: 1
		}
	],
	selectedRentalId: null,
	dates: []
};

moment.locale("fr")

var getNextColorClass = (function () {
  var index = 0;
  var classes = ["primary", "success", "info", "warning", "danger", "primary-flatly", "success-flatly"];
  
  var f = function () {
    var i = index;
    index++;
    if (index === classes.length) {
      index = 0;
    }
  
    return classes[i];
  };
  
  f.reset = function () {
    index = 0;
  }
  
  return f;
})();

data.dates = getInitialDates();
initCalendarRange();
//setRentalColors();
createRentalCalendar();
createRentalForm();
initAddCarForm();
$("#resetButton").on("click", createRentalCalendar);
initForms();
initFormShowButtons();
initOptimiseButton();
initAddRentalForm();

function createRentalCalendar(options) {
	var startOfMonth = moment().date(1);
	var currentDate = moment();
	var startMonth = moment().month();
	var dates = data.dates;
	var rowWidth = (dates.length * 2) + "em";
	var currentMonth = null;
	var currentMonthHeader = null;
	var currentMonthWidth = null;
  var rentalBoxTemplate = $("<span class='data-box'>&nbsp;</span>");
  var _options = $.extend({
    setRentalColors: false,
    resetRentalColors: false
  }, options);
  
  if (_options.setRentalColors) {
    if (_options.resetRentalColors) {
      getNextColorClass.reset();
    }
    setRentalColors();
  }
	
	dates.forEach(function (date) {
		$("#headers-dates").append("<span class='data-box header-date'>" + date.date() + "</span>");
	});
	
  $("#cars").empty();
  $("#headers-dates").empty().outerWidth(rowWidth);
  $("#headers-months").empty().outerWidth(rowWidth);
  dates.forEach(function (date) {
    if (date.month() !== currentMonth) {
      if (currentMonthHeader !== null) {
        currentMonthHeader.outerWidth((currentMonthWidth * 2) + "em");
      }
      currentMonthWidth = 1;
      currentMonth = date.month();
      currentMonthHeader = $("<div class='data-box'>" + date.format("MMMM") + "</div>");
      $("#headers-months").append(currentMonthHeader);
    } else {
      currentMonthWidth++;
    }
    $("#headers-dates").append("<div class='data-box header-date'>" + date.date() + "</div>");
  });
  
  $("#headers-cars").empty().append("<div class='data-box width-full'>&nbsp;</div>").append("<div class='data-box width-full'>&nbsp;</div>");
	
	data.cars.sort(sortByName).forEach(function (car) {
	  var rentals = data.rentals
	    .filter(filterRentalByCar.bind(null, car))
	    .filter(filterRentalByDates.bind(null, data.dates[0], data.dates[data.dates.length - 1]))
	    .sort(sortRentalsByStart);
	  var carContainer = $("<div data-car-id='" + car.id + "'></div>").outerWidth(rowWidth);
	$("#headers-cars").append("<div class='header-car data-box'>" + car.name + "</div>");
    var inRental = false;
    
    for (var i = 0; i < rentals.length; i++) {
      var rental = rentals[i];
      var rentalBox = rentalBoxTemplate.clone()
        .addClass("rental")
        .attr("data-rental-id", rental.id)
        .addClass("data-box-" + rental.colorClass);
      if (data.selectedRentalId === rental.id) {
        rentalBox.addClass("rental-selected");
      }
      
      var displayStart = moment.max(toLocalDate(rental.start), data.dates[0]);
      var displayEnd = moment.min(toLocalDate(rental.end), data.dates[data.dates.length - 1]);
      var rentalLength = displayEnd.diff(displayStart, "days") + 1;
      
      if (i == 0) {
        rentalBox.css({
          "margin-left": (displayStart.diff(dates[0], "days") * 2) + "em"
        });
      } else {
        var previousRental =  rentals[i - 1];
        var previousDisplayEnd = moment.min(toLocalDate(previousRental.end), data.dates[data.dates.length - 1]);
        var daysBetween = displayStart.diff(previousDisplayEnd, "days");
        rentalBox.css({
          "margin-left": ((daysBetween - 1) * 2) + "em"
        });
      }
      
      rentalBox.outerWidth((rentalLength * 2) + "em");
      rentalBox.on("click", {
          rental: rental
        }, function (event) {
          if (data.selectedRentalId !== event.data.rental.id) {
            editRental(event.data.rental);
            selectRental(event.target);
          } else {
            clearRental();
            deselectRental(event.target);
          }
        });
      carContainer.append(rentalBox);
    }
    
    if (rentals.length === 0) {
      carContainer.append("<div class='data-box data-box-empty'>&nbsp;</div>");
    }

	  $("#cars").append(carContainer);
	});
}

function createRentalForm() {
  var form = $("#rentalForm");
  form.find("select[name=carId]")
    .on("change", function () {
      var rentalId = parseInt(form.find("input[name=rentalId]").val());
      var rental = data.rentals.filter(function (rental) {
        return rental.id === rentalId;
      })[0];
      rental.carId = parseInt(this.value);
      var minimumCategory = data.categories[rental.categoryId];
      var rentalCar = findById(data.cars, rental.carId);
      var rentalCategory = data.categories[rentalCar.categoryId];
      
      createRentalCalendar();
      updateRentalCategoryText(rentalCategory, minimumCategory);
    });
}

function editRental(rental) {
  var rentalCar = findById(data.cars, rental.carId);
  var minimumCategory = data.categories[rental.categoryId];
  var rentalCategory = data.categories[rentalCar.categoryId];
  var form = $("#rentalForm");
  var options = data.cars
    .sort(sortByName)
    .map(function (car) {
      return $("<option value='" + car.id + "'>" + car.name + "</option>").prop("disabled", data.categories[car.categoryId].rank < minimumCategory.rank);
    });
  form.find("select[name=carId]")
    .empty()
    .append(options)
    .val(rentalCar.id);

  $("#rentalDateStart").text(toLocalDate(rental.start).format("L"));
  $("#rentalDateEnd").text(toLocalDate(rental.end).format("L"));
  updateRentalCategoryText(rentalCategory, minimumCategory);
  form.find("input[name=rentalId]").val(rental.id);
  data.selectedRentalId = rental.id;
}

function clearRental() {
  $("select[name=carId]").val(null);
  $("input[name=rentalId]").val(null);
  $("#rentalDateStart,#rentalDateEnd").empty();
  data.selectedRentalId = null;
}

function selectRental(element) {
  $(".rental-selected").removeClass("rental-selected");
  $(element).addClass("rental-selected");
  hideForms();
  $("#rentalForm").removeClass("hidden");
}

function deselectRental(element) {
  $(".rental-selected").removeClass("rental-selected");
  $("#rentalForm").addClass("hidden");
}

function initAddCarForm() {
  populateCategoryIdSelect($("#addCarForm [name=categoryId]"));
}

function addCarFormOnSubmit() {
  var form = $("#addCarForm");
  var name = form.find("input[name=name]");
  var category = form.find("select[name=categoryId]");
  var car = {
    id: data.cars.length + 1,
    name: name.val(),
    categoryId: parseInt(category.val())
  };
  data.cars.push(car);
  clearForm(form);
  createRentalCalendar();
}

function initForms() {
  $("form").on("submit", function (event) {
    event.preventDefault();
  });
  $("form[data-form-submit]").on("submit", function () {
    window[this.id + "OnSubmit"]();
  });
}

function initFormShowButtons() {
  $("button[data-form-show]").on("click", function () {
    hideForms();
    $($(this).attr("data-form-show"))
      .trigger("show.colibri")
      .removeClass("hidden");
  });
}

function initOptimiseButton() {
  $("#optimiseButton").on("click", function () {
    optimise();
    createRentalCalendar();
  });
}

function initAddRentalForm() {
  var form = $("#addRentalForm");
  populateCategoryIdSelect(form.find("select[name=categoryId]"));
  var carIdSelect = form.find("select[name=carId]");
  form.on("show.colibri", function () {
    populateCarIdSelect(carIdSelect);
  });
  var start = document.querySelector("#addRentalForm [name=start]");
  var end = document.querySelector("#addRentalForm [name=end]");
  rome(start, {
      time: false,
      inputFormat: "L",
      weekStart: 1,
      dateValidator: rome.val.beforeEq(end)
    });
  rome(end, {
      time: false,
      inputFormat: "L",
      weekStart: 1,
      dateValidator: rome.val.afterEq(start)
    });
}

function addRentalFormOnSubmit() {
  var form = $("#addRentalForm");
  var carId = parseInt(form.find("select[name=carId]").val());
  var category = data.categories[parseInt(form.find("[name=categoryId]").val())];
  var start = toLocalDate(form.find("[name=start]").val());
  var end = toLocalDate(form.find("[name=end]").val());
  var rental = {
    id: data.rentals.length + 1,
    start: toLocalDate(form.find("[name=start]").val(), "DD/MM/YYYY").format("YYYY-MM-DD"),
    end: toLocalDate(form.find("[name=end]").val(), "DD/MM/YYYY").format("YYYY-MM-DD"),
    colorClass: getNextColorClass()
  };
  
  
  if (isNaN(carId)) {
    rental.categoryId = category.id;
    var cars = data.cars.filter(function (car) {
      return data.categories[car.categoryId].rank >= category.rank;
    }).filter(function (car) {
      var rentals = data.rentals
        .filter(filterRentalByCar.bind(null, car))
        .filter(filterExcludeRentalOutsideDateRange.bind(null, start, end));

      return rentals.length == 0;
    });
    
    if (cars.length > 0) {
      cars.sort(function (car1, car2) {
        return data.categories[car1.categoryId].rank - data.categories[car2.categoryId].rank;
      });
      rental.carId = cars[0].id;
    } else {
      alert("Aucune voiture n'a pu être attribuée, veuillez en choisir une.");
      return;
    }
  } else {
    rental.carId = carId;
    rental.categoryId = findById(cars, carId).categoryId;
  }
  
  data.rentals.push(rental);
  clearForm(form);
  createRentalCalendar();
}

function optimise() {
  // line up rentals on minimal number of cars
  // favour contiguous rentals: end followed by start in same place
  // rental can be fixed or not: fixed if it has already started, is about to start or manually set to fixed for business reasons. Fixed rental is attached to a car and cannot move.
  
  // separate rentals per category
  // sort rentals by start
  // create "rental block": end1 = start2 && location_end1 = location_start2
  // create rental block with gap below threshold? Eg. block with 1-day gap
  // take maintainance windows into account when assigning rental to car
  

  // clear out car assignments  
  data.rentals.forEach(function (rental) {
    delete rental.carId;
  });
  
  // sort rentals by category
  var rentalsByCategory = {};
  data.rentals.forEach(function (rental) {
    var category = data.categories[rental.categoryId];
    if (rentalsByCategory[rental.categoryId] === undefined) {
      rentalsByCategory[rental.categoryId] = [];
    }
    rentalsByCategory[rental.categoryId].push(rental);
  });
  
  // sort rentals by start date
  Object.keys(rentalsByCategory).forEach(function (categoryId) {
    rentalsByCategory[categoryId] = rentalsByCategory[categoryId].sort(sortRentalsByStart);
  });
  
  // assign rentals to cars
  var success = true;
  Object.keys(rentalsByCategory).forEach(function (categoryId) {
    var rentals = rentalsByCategory[categoryId];
    var cars = data.cars
      .filter(filterCarByCategory.bind(null, parseInt(categoryId)));
    
    for (var i = 0; i < rentals.length; i++) {
      var rental = rentals[i];
      var availableCars = cars.filter(function (car) {
        return data.rentals
          .filter(filterRentalByCar.bind(car))
          .filter(filterExcludeRentalOutsideDateRange.bind(null, toLocalDate(rental.start), toLocalDate(rental.end)))
          .length === 0;
      });
      if (availableCars.length > 0) {
        rental.carId = availableCars[0].id;
      } else {
        console.log("No car in category " + data.categories[categoryId] + " available " + rental.start + " => " + rental.end);
        success = false;
      }
    }
  });
  
  return success;
}

function sortByName(o1, o2) {
  return o1.name.localeCompare(o2.name);
}

function sortRentalsByStart(rental1, rental2) {
  return toLocalDate(rental1.start) - toLocalDate(rental2.start);
}

function filterRentalByCar(car, rental) {
  return rental.carId === car.id;
}

function filterRentalByDates(start, end, rental) {
  var rentalEnd = toLocalDate(rental.end);
  var rentalStart = toLocalDate(rental.start);
  if (start.isAfter(rentalEnd)) {
    return false;
  }
  
  if (end.isBefore(rentalStart)) {
    return false;
  }
  
  return true;
}

function filterExcludeRentalOutsideDateRange(start, end, rental) {
  var rentalStart = toLocalDate(rental.start);
  var rentalEnd = toLocalDate(rental.end);

  if (start.isSame(rentalStart) || end.isSame(rentalStart) || start.isSame(rentalEnd) || end.isSame(rentalEnd) ) {
    return true;
  }

  if (start.isBefore(rentalStart) && end.isAfter(rentalEnd)) {
    return true;
  }
  
  if (start.isAfter(rentalStart) && start.isBefore(rentalEnd)) {
    return true;
  }
  
  if (end.isAfter(rentalStart) && end.isBefore(rentalEnd)) {
    return true;
  }
  
  return false;
}

function filterCarByCategory(categoryId, car) {
  return car.categoryId === categoryId;
}

function findById(list, id) {
  return list.filter(function (item) {
    return item.id === id;
  })[0];
}

function populateCarIdSelect(select) {
  var options = data.cars
    .sort(sortByName)
    .map(function (car) {
      return $("<option value='" + car.id + "'>" + car.name + "</option>");
    });
  select
    .empty()
    .append("<option></option>")
    .append(options);
}

function populateCategoryIdSelect(select) {
  var options = Object.keys(data.categories)
    .map(function (key) { return data.categories[key]; })
    .sort(sortByName)
    .map(function (category) {
      return $("<option value='" + category.id + "'>" + category.name + "</option>");
    });
  select
    .empty()
    .append("<option></option>")
    .append(options);
}

function hideForms() {
  $("#formsContainer form").addClass("hidden");
}

function clearForm(form) {
  form.find(":input").val(null);
}

function toLocalDate(dateString, format) {
  if (format === undefined) {
    format = "YYYY-MM-DD";
  }
  return moment(dateString, format).local().startOf("day");
}

function isoDateIn(amount, unit) {
  return moment().add(amount, unit).format("YYYY-MM-DD");
}

function getInitialDates() {
  var dates = [];
  var currentDate = moment().local();
	for (var i = 0; i < 31; i++) {
		dates.push(currentDate.clone().startOf("day"));
		currentDate.add(1, "days");
	}

  return dates;
}

function setDateRange(start, end) {
  var _start = toLocalDate(start);
  var _end = toLocalDate(end);
  var current = _start;
  var dates = [];
  
  while (current.isBefore(_end) || current.isSame(_end, "day")) {
    dates.push(current.clone());
    current.add(1, "days");
  }
  
  data.dates = dates;
  createRentalCalendar({
    setRentalColors: true,
    resetRentalColors: true
  });
}

function initCalendarRange() {
  var start = document.querySelector("input[name=calendar-start]");
  var end = document.querySelector("input[name=calendar-end]");
  var startDate = moment().startOf("day");
  var endDate = moment().add(31, "days").startOf("day");
  setDateRange(startDate, endDate);
  
  var onData = function (newDate) {
    setDateRange(toLocalDate(start.value, "L"), toLocalDate(end.value, "L"));
  };

  rome(start, {
      initialValue: startDate,
      time: false,
      inputFormat: "L",
      weekStart: 1,
      dateValidator: rome.val.beforeEq(end)
    })
    .on("data", onData);
  rome(end, {
      initialValue: endDate,
      time: false,
      inputFormat: "L",
      weekStart: 1,
      dateValidator: rome.val.afterEq(start)
    })
    .on("data", onData);
}

function setRentalColors() {
  data.rentals
    .filter(filterRentalByDates.bind(null, data.dates[0], data.dates[data.dates.length - 1]))
    .sort(sortRentalsByStart)
    .forEach(function (rental) {
      rental.colorClass = getNextColorClass();
    });
}

function updateRentalCategoryText(rentalCategory, minimumCategory) {
  var rentalCategoryText = rentalCategory.name;
  if (rentalCategory !== minimumCategory) {
    rentalCategoryText += " (transféré de " + minimumCategory.name + ")";
  }
  $("#rentalCategory").text(rentalCategoryText);
}
