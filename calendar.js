// =====================================================
// REMINDO v1.6
// CALENDAR ENGINE
// =====================================================


let reminders =

JSON.parse(localStorage.getItem("reminders")) || [];



let currentDate = new Date();







const calendarGrid =

document.getElementById("calendarGrid");



const monthYear =

document.getElementById("monthYear");



const upcomingList =

document.getElementById("upcomingList");







// =====================================================
// LOAD CALENDAR
// =====================================================


function renderCalendar(){



calendarGrid.innerHTML="";



const year =

currentDate.getFullYear();



const month =

currentDate.getMonth();






const firstDay =

new Date(year,month,1).getDay();





const lastDate =

new Date(year,month+1,0).getDate();






monthYear.innerText =

currentDate.toLocaleDateString(

"en-US",

{

month:"long",

year:"numeric"

}

);








// EMPTY SPACES BEFORE MONTH


for(let i=0;i<firstDay;i++){


const empty =

document.createElement("div");


empty.className="calendar-day empty";


calendarGrid.appendChild(empty);


}









// DAYS


for(let day=1;day<=lastDate;day++){



const dayBox =

document.createElement("div");



dayBox.className="calendar-day";





dayBox.innerHTML = `

<span>

${day}

</span>

`;







const dateString =

`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;








const dayReminders =

reminders.filter(item=>{


return item.dueDate === dateString;


});








if(dayReminders.length>0){



dayBox.classList.add("has-reminder");



const marker =

document.createElement("small");



marker.innerHTML="●";



dayBox.appendChild(marker);



}









dayBox.addEventListener("click",()=>{



showDayReminders(dateString);



});






calendarGrid.appendChild(dayBox);



}






}











// =====================================================
// SHOW REMINDERS FOR SELECTED DAY
// =====================================================


function showDayReminders(date){



const selected =

reminders.filter(item=>{


return item.dueDate === date;


});






if(selected.length===0){



alert(

"No reminders on this date."

);



return;


}







let message =

"";





selected.forEach(item=>{



message +=

item.title +

"\n";


});







alert(message);



}











// =====================================================
// UPCOMING REMINDERS
// =====================================================


function loadUpcoming(){



upcomingList.innerHTML="";



const today = new Date();

today.setHours(0,0,0,0);





const upcoming =

reminders

.filter(item=>{


const date =

new Date(item.dueDate);


return date >= today;


})

.sort((a,b)=>{


return new Date(a.dueDate)

-

new Date(b.dueDate);


})

.slice(0,10);








if(upcoming.length===0){



upcomingList.innerHTML =

"<p>No upcoming reminders.</p>";



return;


}








upcoming.forEach(item=>{



const div =

document.createElement("div");



div.className="upcoming-item";



div.innerHTML = `


<strong>

${item.title}

</strong>


<br>


${new Date(item.dueDate)
.toLocaleDateString("en-GB")}



`;



upcomingList.appendChild(div);



});



}











// =====================================================
// MONTH BUTTONS
// =====================================================


document

.getElementById("previousMonth")

.addEventListener("click",()=>{


currentDate.setMonth(

currentDate.getMonth()-1

);


renderCalendar();


});








document

.getElementById("nextMonth")

.addEventListener("click",()=>{


currentDate.setMonth(

currentDate.getMonth()+1

);


renderCalendar();


});









// =====================================================
// START
// =====================================================


renderCalendar();

loadUpcoming();
