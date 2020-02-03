const button = document.querySelector('.choosing');
button && button.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currency = event.target.querySelector('.currency').value;
    const origin = event.target.querySelector('.origin').value;
    const destination = event.target.querySelector('.destination').value;
    const beginning_of_period = event.target.querySelector('.beginning_of_period').value;
    const one_way = event.target.querySelector('.one_way').value;
    const limit = event.target.querySelector('.limit').value;
    const sorting = event.target.querySelector('.sorting').value;
    const trip_duration = event.target.querySelector('.trip_duration').value;
    //
    const response = await fetch(
        '/ticket/check',
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currency: currency,
                origin: origin,
                destination: destination,
                beginning_of_period: beginning_of_period,
                one_way: one_way,
                limit: limit,
                sorting: sorting,
                trip_duration: trip_duration
            })
        }
    );
    let data = await response.json();
    // console.log(data);
    // STEP 2
    let response2 = await fetch(data.url);
    let data2 = await response2.json();

    let response3 = await fetch(
        '/ticket/results',
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tickets: data2
            })
        }
    )
    let data3 = await response3.text();
    document.querySelector('.finalresults').innerHTML=data3;

});

const addingButton = document.querySelector('.addingtravel');
addingButton && addingButton.addEventListener('submit', async (event)=>{
    const origin = event.target.children[0].children.origin.firstElementChild.innerText;
    const destination = event.target.children[0].children.destination.firstElementChild.innerText;
    const departdate = event.target.children[0].children.departdate.firstElementChild.innerText;
    const changes = event.target.children[0].children.numberofchanges.firstElementChild.innerText;
    const cost = event.target.children[0].children.value.firstElementChild.innerText;
    const response = await fetch('/traveladd',
       {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
               origin,
               destination,
               departdate,
               changes,
               cost
           })
       });
    const result = await response.json();
    const url = result.username;
    console.log(url);
    window.location=`/${url}`
});
