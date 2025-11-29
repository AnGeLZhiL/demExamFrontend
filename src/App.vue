<template>
  <main class="flex-center page bg-gray p-1 m-0">
    <section class="login-form bg-white m-0">
      <header>
        <h1 class="login-form__header text-dark-blue text-bold">ExamManage</h1>
      </header>
      <form>
        <fieldset class="login-form__fieldset p-0">
          <legend class="login-form__legend text-regular text-dark-blue p-0">Логин</legend>
          <input 
            type="email" 
            class="login-form__input text-dark-blue"
            placeholder="Введите логин"
          >
        </fieldset>
        <fieldset class="login-form__fieldset p-0">
          <legend class="login-form__legend text-regular text-dark-blue p-0">Пароль</legend>
          <input 
            type="password" 
            class="login-form__input text-dark-blue"
            placeholder="Введите пароль"
          >
        </fieldset>

      </form>
    </section>
  </main>
</template>

<script setup>
</script>

<style scoped>

:root {
  font-size: 16px; /* 1rem = 16px */
}

html, body {
  font-family: 'Montserrat', sans-serif;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.login-form {
  width: min(100%, 40rem);
  padding: clamp(0.6rem, 2vw, 3rem);
  border-radius: clamp(0.6rem, 1vw, 2rem);
}

/* МОДИФИКАТОРЫ БЛОКОВ */

/* ЭЛЕМЕНТЫ */
.login-form__header {
  width: 100%;
  text-align: center;
  margin-bottom: clamp(0.6rem, 2vw, 3rem);
  font-size: clamp(0.8rem, 2.1vw, 2.5rem);
}

.login-form__fieldset {
  border: none;
  margin-bottom: clamp(0.8rem, 1.5vw, 2rem);
  width: 100%;
}

.login-form__legend {
  font-weight: 600;
  margin-bottom: clamp(0.3rem, 0.5vw, 1rem);
  font-size: clamp(0.6rem, 1.8vw, 1.5rem);
  width: 100%;
}

.login-form__input {
  width: 100%;
  padding: clamp(0.6rem, 2vw, 0.8rem) clamp(0.8rem, 2vw, 1rem);
  border: 2px solid #E0E0E0;
  border-radius: clamp(0.3rem, 0.5vw, 0.7rem);
  font-size: clamp(0.6rem, 1.5vw, 1.5rem);
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.login-form__input:focus {
  outline: none;
  border-color: #2E80ED;
}

.login-form__input::placeholder {
  font-size: clamp(0.6rem, 1.5vw, 1.5rem);
  color: #878787;
  font-weight: 400;
}

/* УТИЛИТАРНЫЕ КЛАССЫ (могут использоваться везде) */
.bg-gray {background: #F2F4F7;}
.bg-white {background: white;}
.text-dark-blue {color: #333333;}
.text-dark-gray {color: #64748B;}
.text-bold {font-weight: 700;}
.text-regular {font-weight: 400;}
.text-medium {font-weight: 500;}
.text-semiBold {font-weight: 600;}
.m-0 {margin: 0;}
.p-0 {padding: 0;}
.p-1 {padding: 1rem;}
</style>