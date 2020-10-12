<template>
  <div>
    <div :class="'notification is-' + message.type" v-if="message && message.string">
      {{ message.string }}
    </div>
    <table class="table is-bordered is-hoverable is-striped is-fullwidth">
      <tbody>
        <tr v-for="(row, rowIndex) in board" v-bind:key="rowIndex">
          <td v-for="(item, index) in row" v-bind:key="index" v-on:click="move(rowIndex, index)">
             <span v-if="item === 'O'">O</span>
             <span v-if="item === 'X'">&#x2718;</span>
             <span v-if="item === undefined">&nbsp;</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-show="stateName === 'origin'">Push the Start button to play!</p>
    <br />
    <div class="buttons">
      <button class="button is-info"  v-show="stateName === 'origin'" v-on:click="startGame">Start</button>
      <button class="button is-danger" v-show="stateName !== 'origin'"  v-on:click="resetGame">Reset</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { interpret } from 'xstate';
import Machine from './../t3-machine';

const t3MachineService = interpret(Machine.withContext({
  boardSize: 3
}));
t3MachineService.start();

export default Vue.extend({
  data() {
    return {
      ...t3MachineService.machine.context,
      message: undefined,
      stateName: ''
    };
  },
  methods: {
    startGame: function (_: Event) {
      t3MachineService.send('START');
    },
    resetGame: function (_: Event) {
      t3MachineService.send('RESET');
    },
    move: function (x: number, y: number) {
      t3MachineService.send('MOVE', { x, y });
    }
  },
  mounted() {
    t3MachineService.onTransition(s => {
      this.$data.moves = [ ...s.context.moves ];
      this.$data.board = [ ...s.context.board ];
      this.$data.message = {
        ...s.context.message
      };
      this.$data.boardSize = s.context.boardSize;
      this.$data.stateName = s.value;
    })
  }
});
</script>

<style lang="scss" scoped>
.table {
  td {
    &:hover {
      background-color: grey;
      cursor: pointer;
    }
    text-align: center;
    font-size: 24px;
  }
}


</style>