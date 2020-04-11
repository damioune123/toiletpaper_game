<template>
  <div
    class="background"
    style="width: 100%;height: 100%;background-image: url('src/img/motifs/bleu_petite_ligne.png');"
  >
    <div class="flex-container-col">
      <div class="intro-header">
        <h1 class="">Toilet Paper Game</h1>
      </div>
      <div class="border-only-main half flex-container-col">
        <div class="">
          <div class="flex-item-line">
            <br />
            <div class="border-pink">
              <h2>Waiting for everyone ...</h2>
            </div>
            <br />
            <div class="flex-container-row">
              <ul id="lobbyPlayersList" class="flex-container-row"></ul>
            </div>
            <button id="btnStartGame" class="btn-start">START GAME</button
            ><br />

            <h3 class="border-pink" style="color: white;">
              <span style="font-size:1rem; color:black"
                >Share this link to your friend :</span
              ><br />
              <span class="game-link"
                >toiletpapergame.herokuapp.com/<span id="lobbyRoomName"></span
              ></span>
              <br /><button class="btn-copy-link">COPY LINK</button>
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- <p id="lobbyCurrentUser"></p>
    <p id="lobbyAmountTotalPlayers"></p>
    <p id="lobbyAmountConnectedPlayers"></p> -->

    <div class="intro-footer">
      <h3><u> quit </u></h3>
    </div>
  </div>
</template>

<script>
import ClientUserAppMixin from "../mixins/ClientUserAppMixin";
export default {
  name: "Lobby",
  mixins: [ClientUserAppMixin]
};
</script>
<style lang="css">
.flex-container-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-content: space-evenly;
}
.intro-main {
  background-color: pink;
  width: 80%;
  flex-basis: 30%;
  /* border: 1rem solid black; */
  border-radius: 3rem;
}

.half {
  flex-basis: 15%;
}

.intro-header,
.intro-footer {
  text-align: center;
  /* flex-shrink: 5; */
  /* flex: 1 0 1; */
}

.flex-item-line {
  /* width: 25%; */
  text-align: center;
  text-transform: uppercase;
}

.intro-header {
  height: 10%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.flex-container-row li {
  list-style: none;
  width: 25%;
  text-align: center;
  text-transform: lowercase;
  font-size: 3rem;
  font-family: "Roboto", sans-serif;
  font-weight: 700;
  font-style: italic;
  font-style: oblique 5deg;
  color: white;
  letter-spacing: -0.1rem;
  margin: 0;
  background-color: black;
  color: white;
  padding: 0.7rem;
  padding-right: 0.7rem;
  padding-right: 0.9rem;
}
body {
  background-color: lightblue;
  height: 100vh;
  margin: 0px;
  font-family: "Roboto", sans-serif;
  font-size: 2rem;
  background-position: center;
  /*  flex-start*/
  /* background-image: url('img/motifs/bleu_petite_ligne.png'); */
}

h1 {
  font-family: "Roboto", sans-serif;
  font-weight: 700;
  font-style: oblique 5deg;
  color: white;
  font-size: 6.5rem;
  letter-spacing: -0.2rem;
  margin: 0;
}

h2 {
  font-family: "Roboto", sans-serif;
  font-weight: 700;
  /* font-style: oblique 5deg; */
  color: white;
  font-size: 4.5rem;
  letter-spacing: -0.2rem;
  margin: 0;
  text-transform: none;
}

h3 {
  font-family: "Roboto", sans-serif;
  font-weight: 700;
  font-style: oblique 5deg;
  color: black;
  font-size: 2.5rem;
  letter-spacing: -0.1rem;
  margin: 0;
  text-transform: none;
}
h4 {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  /* font-style: oblique 5deg; */
  color: black;
  font-size: 2.2rem;
  letter-spacing: -0.1rem;
  margin: 0;
}

p {
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
}
</style>
