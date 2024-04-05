async function getRestaurantData() {
  try {
    const response = await fetch(
      'https://10.120.32.94/restaurant/api/v1/restaurants'
    );
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.log('restaurant data error', error.message);
  }
}

async function getWeeklyMenu(id) {
  try {
    const response = await fetch(
      `https://10.120.32.94/restaurant/api/v1/restaurants/weekly/${id}/fi`
    );
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.log('weekly menu error', error);
  }
}

async function processRestaurants() {
  const restaurants = await getRestaurantData();

  restaurants.sort((a, b) =>
    a.name.toLowerCase().trim().localeCompare(b.name.toLowerCase().trim())
  );

  return restaurants;
}

async function createTables(sortBy) {
  const tableNode = document.querySelector('table');
  const allButHeaders = tableNode.querySelectorAll('tr:not(:first-child)');

  allButHeaders.forEach((row) => {
    tableNode.removeChild(row);
  });

  let restaurants = await processRestaurants();

  switch (sortBy) {
    case 'all':
      break;
    case 'sodexo':
      restaurants = restaurants.filter(
        (restaurant) => restaurant.company.toLowerCase() === 'sodexo'
      );
      break;
    case 'compass group':
      restaurants = restaurants.filter(
        (restaurant) => restaurant.company.toLowerCase() === 'compass group'
      );
  }
  console.log(sortBy, restaurants);

  const modal = document.querySelector('dialog');
  const modalDivs = modal.querySelectorAll('div');
  modalDivs.forEach((div) => {
    modal.removeChild(div);
  });
  const modalButtons = modal.querySelectorAll('button');
  modalButtons.forEach((button) => {
    modal.removeChild(button);
  });
  const modalContent = document.createElement('div');
  const modalMenu = document.createElement('div');
  const closeBtn = document.createElement('button');
  closeBtn.innerText = 'Close';
  closeBtn.id = 'close-button';

  restaurants.forEach((restaurant) => {
    const tableRow = document.createElement('tr');
    const restaurantName = document.createElement('td');
    const adress = document.createElement('td');
    restaurantName.innerText = restaurant.name;
    adress.innerText = restaurant.address;
    tableRow.appendChild(restaurantName);
    tableRow.appendChild(adress);
    tableNode.appendChild(tableRow);
  });

  const tableData = document.querySelectorAll('table tr:not(:first-child)');
  tableData.forEach((row, index) => {
    row.addEventListener('click', async () => {
      tableData.forEach((row) => row.classList.remove('highlight'));
      row.classList.toggle('highlight');
      const restaurantID = restaurants[index]._id;

      modalContent.innerHTML = '';
      modalMenu.innerHTML = '';

      try {
        const menu = await getWeeklyMenu(restaurantID);

        if (menu.days.length !== 0) {
          for (let i = 0; i < menu.days.length; i++) {
            const menuDay = document.createElement('h4');
            menuDay.innerText = menu.days[i].date;
            modalMenu.appendChild(menuDay);

            const menuDayCourses = menu.days[i].courses;

            if (menuDayCourses.length !== 0) {
              for (let j = 0; j < menuDayCourses.length; j++) {
                const courses = document.createElement('p');
                const price =
                  menuDayCourses[j].price !== null &&
                  menuDayCourses[j].price !== ''
                    ? ` - Price: ${menuDayCourses[j].price}`
                    : '';
                const courseInfo = `${menuDayCourses[j].name} ${price} - Diets: ${menuDayCourses[j].diets}`;
                courses.innerText = courseInfo;
                modalMenu.appendChild(courses);
              }
            } else {
              const courses = document.createElement('p');
              courses.innerText = 'No courses available for this day.';
              modalMenu.appendChild(courses);
            }
          }
        }
      } catch (error) {
        console.error('error fetching weekly menu: ', error);
      }

      const restaurantHeader = document.createElement('h3');
      restaurantHeader.innerText = restaurants[index].name;
      const restaurantAdress = document.createElement('p');
      restaurantAdress.innerText = restaurants[index].address;
      const restaurantPostal = document.createElement('p');
      restaurantPostal.innerText = restaurants[index].postalCode;
      const restaurantCity = document.createElement('p');
      restaurantCity.innerText = restaurants[index].city;
      const restaurantPhone = document.createElement('p');
      restaurantPhone.innerText = restaurants[index].phone;
      const restaurantCompany = document.createElement('p');
      restaurantCompany.innerText = restaurants[index].company;

      modalContent.appendChild(restaurantHeader);
      modalContent.appendChild(restaurantAdress);
      modalContent.appendChild(restaurantPostal);
      modalContent.appendChild(restaurantCity);
      if (restaurantPhone.innerText !== '-') {
        modalContent.appendChild(restaurantPhone);
      }
      modalContent.appendChild(restaurantCompany);
      modal.appendChild(modalContent);
      modal.appendChild(modalMenu);
      modal.appendChild(closeBtn);
      modal.showModal();
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.close();
  });
}

const displayAll = document.getElementById('default');
displayAll.addEventListener('click', async () => {
  createTables('all');
});

const sodexoButton = document.getElementById('sodexoBtn');
sodexoButton.addEventListener('click', async () => {
  createTables('sodexo');
});

const compassButton = document.getElementById('compassBtn');
compassButton.addEventListener('click', async () => {
  createTables('compass group');
});

createTables('all');
