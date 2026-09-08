<script setup>


defineProps({

  question:String

});


</script>


<template>

<button class="quick-question">

{{ question }}

</button>

</template>


<style scoped>


.quick-question{


  border:none;


  background: var(--color-surface);

  color: var(--color-text-primary);


  padding:10px 14px;


  border-radius: var(--radius-lg);


  white-space:nowrap;


  box-shadow: 0 2px 8px rgba(0,0,0,.06);


  cursor:pointer;


}



.quick-question:active{

  transform:scale(.96);

}


</style>