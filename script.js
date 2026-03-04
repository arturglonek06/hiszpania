document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIKA WŁASNEGO KALENDARZA ---
    const dateRangeInput = document.getElementById('dateRangeInput');
    const customCalendar = document.getElementById('customCalendar');
    const calendarDays = document.getElementById('calendarDays');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const calendarInfo = document.getElementById('calendarInfo');
    
    let currentDate = new Date();
    let today = new Date();
    today.setHours(0,0,0,0);

    let checkInDate = null;
    let checkOutDate = null;

    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

    dateRangeInput.addEventListener('click', (e) => {
        e.stopPropagation();
        customCalendar.classList.toggle('active');
        renderCalendar();
    });

    document.addEventListener('click', (e) => {
        if (!customCalendar.contains(e.target) && e.target !== dateRangeInput) {
            customCalendar.classList.remove('active');
        }
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    function renderCalendar() {
        calendarDays.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1; 

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            calendarDays.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;
            
            const cellDate = new Date(year, month, i);
            cellDate.setHours(0,0,0,0);

            if (cellDate < today) {
                dayDiv.classList.add('disabled');
            } else {
                if (checkInDate && cellDate.getTime() === checkInDate.getTime()) {
                    dayDiv.classList.add('selected-start');
                }
                if (checkOutDate && cellDate.getTime() === checkOutDate.getTime()) {
                    dayDiv.classList.add('selected-end');
                }
                if (checkInDate && checkOutDate && cellDate > checkInDate && cellDate < checkOutDate) {
                    dayDiv.classList.add('in-range');
                }

                dayDiv.addEventListener('click', () => selectDate(cellDate));
            }

            calendarDays.appendChild(dayDiv);
        }
    }

    function selectDate(clickedDate) {
        if (!checkInDate || (checkInDate && checkOutDate) || clickedDate < checkInDate) {
            checkInDate = clickedDate;
            checkOutDate = null;
            calendarInfo.textContent = "Krok 2: Wybierz datę wyjazdu";
        } else if (!checkOutDate && clickedDate > checkInDate) {
            checkOutDate = clickedDate;
            calendarInfo.textContent = "Świetnie! Zakres wybrany.";
            setTimeout(() => customCalendar.classList.remove('active'), 500);
        }

        updateInputDisplay();
        renderCalendar();
    }

    function updateInputDisplay() {
        if (checkInDate && !checkOutDate) {
            dateRangeInput.value = `${formatDate(checkInDate)} - ...`;
        } else if (checkInDate && checkOutDate) {
            dateRangeInput.value = `${formatDate(checkInDate)} do ${formatDate(checkOutDate)}`;
        } else {
            dateRangeInput.value = '';
        }
    }

    function formatDate(date) {
        return date.toLocaleDateString('pl-PL');
    }

    // --- LOGIKA WYSYŁANIA FORMULARZA ---
    const form = document.getElementById('bookingForm');
    const statusDiv = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        if (!checkInDate || !checkOutDate) {
            statusDiv.className = 'form-messages msg-error';
            statusDiv.textContent = 'Proszę wybrać pełny zakres dat (przyjazd i wyjazd w kalendarzu).';
            return;
        }

        const bookingData = {
            name: document.getElementById('clientName').value,
            checkIn: checkInDate.toISOString().split('T')[0],
            checkOut: checkOutDate.toISOString().split('T')[0],
            guests: document.getElementById('guests').value,
        };

        statusDiv.className = 'form-messages msg-loading';
        statusDiv.textContent = 'Wysyłanie zapytania...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                statusDiv.className = 'form-messages msg-success';
                statusDiv.textContent = 'Sukces! Rezerwacja została wysłana.';
                form.reset();
                checkInDate = null;
                checkOutDate = null;
                updateInputDisplay();
                renderCalendar();
            } else {
                throw new Error('Błąd serwera');
            }
        } catch (error) {
            statusDiv.className = 'form-messages msg-error';
            statusDiv.textContent = 'Wystąpił błąd. Spróbuj ponownie.';
        } finally {
            submitBtn.disabled = false;
        }
    });
});
