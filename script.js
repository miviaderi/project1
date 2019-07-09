document.addEventListener('DOMContentLoaded', function() {

    var reviewMap;
    var popup = document.getElementById('review-popup');
    var mapBlock = document.getElementById('objects-map');
    var reviewList = document.getElementsByClassName('review-list')[0];
    var reviewBlock = document.getElementsByClassName('review-block')[0];


    ymaps.ready(init);

    function init() {
        reviewMap = new ymaps.Map('objects-map', {
            center: [55.76, 37.64],
            zoom: 10,
            controls: ['zoomControl', 'searchControl', 'typeSelector',  'fullscreenControl', 'routeButtonControl']
        })

        reviewMap.behaviors.enable('scrollZoom');

        // searchControlProvider: 'yandex#search'

        reviewMap.events.add('click', function (e) {

            if (!reviewMap.balloon.isOpen()) {

                var coords = e.get('coords');
                reviewMap.balloon.open(coords, {
                    contentBody: popup.innerHTML,
                });

                addCoordinates(coords);

            }
            else {
                reviewMap.balloon.close();
            }
        });

       
    }

    /**
     * Добавляем координаты в скрытые поля попапа
     * @param coords
     */
    function addCoordinates(coords)
    {
        document.getElementById('latitude').value = coords[0];
        document.getElementById('longitude').value = coords[1];

        var mapForm =  mapBlock.querySelector('#popup-form');
        mapForm.addEventListener('submit', function (e) {
            var formData = new FormData(this);
            var reviewParams = {
                name: formData.get('name'),
                place: formData.get('place'),
                comment: formData.get('comment'),
                coords: coords,
            }
            //добавили отзыв в localstorage
            addReview(reviewParams);
            addPlacemark(coords);
            reviewMap.balloon.close();
            e.preventDefault();
        })

        renderReviews(mapForm, coords);
    }

    /**
     * добавляем точку на карте
     */
    function addPlacemark(coords) {
        content = renderReviews(coords);
        new ymaps.Placemark(coordinates, {
            balloonContent: '<img src="markCurr.png">'
        }, icon)
    }

    /**
     * получили отзывы из localStorage
     * @param coords
     * @returns {any}
     */
    function getReviews(coords) {
        var storageKey = coords.join(',');
        return JSON.parse(localStorage.getItem(storageKey));
    }

    /**
     * добавили отзыв в localStorage
     * @param reviewParams
     */
    function addReview(reviewParams) {
        var storageKey = reviewParams.coords.join(',');
        var storageReviewList = JSON.parse(localStorage.getItem(storageKey));
        console.log(storageReviewList);
        if (!storageReviewList) {
            storageReviewList = [];
            storageReviewList.push(reviewParams)
        } else {
            storageReviewList.push(reviewParams)
        }

        localStorage.setItem(storageKey, JSON.stringify(storageReviewList))
    }

    /**
     * Добавляем отзыв
     * @param form
     * @returns {boolean}
     */
    function renderReviews(form, coords)
    {
        var mapForm =  mapBlock.querySelector('#popup-form');
        var storageReviews  = getReviews(coords);

        var html = '';
        if (!storageReviews) return false;

        html += '<ul>';

        for (let i = 0; i < storageReviews.length; i++) {
            reviewParams = storageReviews[i];
            var reviewItem = createReview(reviewParams);
            html+=reviewItem;
        }

        html += '</ul>';

        return html;

    }

    /**
     * Создаём li с данными отзыва
     * @param review
     * @returns {HTMLElement}
     */
    function createReview(reviewParams) {

        var itemHtml = '<li>';
        var dateFormat = getDate();

        itemHtml+='<span class="review-name">'+reviewParams.name+'</span>';
        itemHtml+='<span class="review-place">'+reviewParams.place+'</span>';
        itemHtml+='<span class="review-date">'+dateFormat+'</span>';
        itemHtml+='<p class="review-comment">'+reviewParams.comment+'</p>';

        itemHtml += '</li>';
        return itemHtml;
    }

    function getDate() {
        var date = new Date();

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + '.' + monthIndex + '.' + year;
    }

})

