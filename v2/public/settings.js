

name_field = document.getElementById("player_name")

if(getCookie2("playerName") == "")
{
    name_field.value = "Anonymous";
}
else
{
    name_field.value = getCookie2("playerName");
}

function SetName() {
    document.cookie = "playerName=" + name_field.value + ";path=/";
}