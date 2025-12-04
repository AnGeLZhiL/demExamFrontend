<template>
  <main class="flex-center page bgс-gray p-1 m-0">
    <section class="login-form bgс-white m-0">
      <header>
        <h1 class="login-form__header text-dark-blue text-bold">ExamManage</h1>
      </header>
      <form @submit.prevent="handleLogin">
        <fieldset class="login-form__fieldset p-0">
          <legend class="login-form__legend text-regular text-dark-blue p-0">Логин</legend>
          <input 
            type="text" 
            class="login-form__input text-dark-blue"
            :class="{ 'login-form__input--error': errors.login }"
            placeholder="Введите логин"
            v-model="form.login"
          >
          <span v-if="errors.login" class="login-form__error">
            {{ errors.login }}
          </span>
        </fieldset>
        <fieldset class="login-form__fieldset p-0">
          <legend class="login-form__legend text-regular text-dark-blue p-0">Пароль</legend>
          <input 
            type="password" 
            class="login-form__input text-dark-blue"
            :class="{ 'login-form__input--error': errors.password }"
            placeholder="Введите пароль"
            v-model="form.password"
          >
          <span v-if="errors.password" class="login-form__error">
            {{ errors.password }}
          </span>
        </fieldset>
        <button 
          type="submit"
          class="login-form__button text-white text-semiBold"
          :disabled="loading">
          <span v-if="loading">Вход...</span>
          <span v-else>Войти</span>
        </button>
        <footer class="login-form__footer">
          <p class=" text-dark-gray text-regular">
            Нет аккаунта? <span class="text-blue text-semiBold">Обратитесь к администратору</span>
          </p>
        </footer>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/services/authService'

const router = useRouter()

const form = reactive({
  login: '',
  password: ''
})

const errors = reactive({
  login: '',
  password: ''
})

const loading = ref(false)

const validateForm = () => {
  let isValid = true

  errors.login = ''
  errors.password = ''

  if (!form.login.trim()) {
    errors.login = 'Логин обязателен'
    isValid = false
  }

  if (!form.password.trim()) {
    errors.password = 'Пароль обязателен'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  // 🎯 ДОБАВЬ СЮДА console.log для отладки
  console.log('🟡 Кнопка нажата!')
  console.log('📝 Данные формы:', form)
  
  if (!validateForm()) {
    console.log('❌ Форма не прошла валидацию')
    return
  }
  
  console.log('✅ Форма валидна, отправляем...')
  
  loading.value = true
  
  try {
    const response = await AuthService.login({
      login: form.login,
      password: form.password
    })

    const data = response.data
    console.log('✅ Успешный вход:', data)

    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('event_account', JSON.stringify(data.event_account))

    alert(`Добро пожаловать, ${data.user.first_name}!`)
    router.push('/events')
    
  } catch (error) {
    console.error('❌ Ошибка входа:', error)
    
    if (error.response?.status === 422) {
      errors.login = error.response.data.message || 'Неверные учетные данные'
    } else if (error.response?.status === 500) {
      errors.login = 'Ошибка сервера. Попробуйте позже.'
    } else if (error.message === 'Network Error') {
      errors.login = 'Ошибка соединения. Проверьте интернет.'
    } else {
      errors.login = 'Произошла ошибка. Попробуйте еще раз.'
    }
  } finally {
    loading.value = false
  }
}

// 🎯 WATCH ДОЛЖЕН БЫТЬ ЗДЕСЬ (вне функций)
watch([() => form.login, () => form.password], () => {
  if (form.login && errors.login) errors.login = ''
  if (form.password && errors.password) errors.password = ''
})
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

/* моя форма для ввода данных */
.login-form {
  width: min(100%, 40rem);
  padding: clamp(0.6rem, 2vw, 3rem);
  border-radius: clamp(0.6rem, 1vw, 2rem);
}

/* МОДИФИКАТОРЫ БЛОКОВ */

/* ЭЛЕМЕНТЫ */
/* заголовки */
.login-form__header {
  width: 100%;
  text-align: center;
  margin-bottom: clamp(0.6rem, 2vw, 3rem);
  font-size: clamp(0.8rem, 2.1vw, 2.5rem);
}
/* элемент шруппировки для ввода данных */
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

/* поля ввода */
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

/* кнопки */
.login-form__button {
  width: 100%;
  padding: clamp(0.6rem, 1vw, 1.3rem) clamp(0.8rem, 2vw, 1rem);
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: clamp(0.3rem, 0.5vw, 0.7rem);
  font-size: clamp(0.7rem, 1.8vw, 1.6rem);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: clamp(0.5rem, 0.6vw, 1rem);
}

.login-form__button:hover {
  background: #1E6FD9;
}

.login-form__button:active {
  background: #1A65C7;
  transform: scale(0.98);
}

.login-form__button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.3);
}

/* футер формы */
.login-form__footer {
  text-align: center;
  width: 100%;
  font-size: clamp(0.5rem, 1.3vw, 1rem);
}

/* для ошибок */
.login-form__error {
  display: block;
  color: #ef4444;  /* Красный цвет */
  font-size: clamp(0.4rem, 1.1vw, 0.8rem);
  margin-top: 0.3rem;
  font-weight: 500;
}

.login-form__input--error {
  border-color: #ef4444 !important;
}

.login-form__button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.login-form__button:disabled:hover {
  background: #9ca3af;
  transform: none;
  box-shadow: none;
}

/* УТИЛИТАРНЫЕ КЛАССЫ (могут использоваться везде) */
.bgс-gray {background: #F2F4F7;}
.bgс-white {background: white;}

.text-dark-blue {color: #333333;}
.text-dark-gray {color: #64748B;}
.text-blue {color: #2E80ED;}
.text-bold {font-weight: 700;}
.text-regular {font-weight: 400;}
.text-medium {font-weight: 500;}
.text-semiBold {font-weight: 600;}
.m-0 {margin: 0;}
.p-0 {padding: 0;}
.p-1 {padding: 1rem;}
</style>