<script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
  const tracks = reactive([
    {
      name: '可愛くてごめん',
      artist: 'HoneyWorks/かぴ',
      cover: `https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs/other/202308221727225.png`,
      source: 'https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs//music/zmka.ogg',
      favorited: true
    },
    {
      name: 'アイドル',
      artist: 'YOASOBI',
      cover: `https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs@latest/music/202308212015229.png`,
      source: 'https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs//music/YOASOBI.mp3',
      favorited: true
    },
    {
      name: '这个世界会好吗(2015)',
      artist: '李x',
      cover: `https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs//music/zgsj2015.png`,
      source: 'https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs//music/zgsjhhm(2015).mp3',
      favorited: true
    },

    {
      name: '张三的歌',
      artist: '张悬',
      cover: `https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs//music/zx.png`,
      source: 'https://gcore.jsdelivr.net/gh/whcxxb/blog-imgs//music/zsdg.mp3',
      favorited: true
    }
  ])
  let barWidth = ref<string | number>('')
  let duration = ref('')
  let currentTime = ref('')
  let isTimerPlaying = ref(false)
  let currentTrackIndex = ref(0)
  let currentTrack = tracks[0]
  let progress = ref<HTMLElement | null>(null)
  let audio = ref<any>()
  const playImgsRef = ref<any>(null)
  const circle = ref<HTMLElement | null>(null)
  const isRight = ref(false)
  const tracksImgs = reactive([tracks[0]])
  onMounted(() => {
    audio.value = new Audio()
    audio.value.ontimeupdate = () => {
      generateTime()
    }
    audio.value.onloadedmetadata = () => {
      generateTime()
    }
    audio.value.onended = () => {
      nextTrack()
    }
  })
  const prevTrack = () => {
    if (currentTrackIndex.value <= 0) {
      currentTrackIndex.value = 0
      return
    } else {
      currentTrackIndex.value--
      playImgsRef.value.style.setProperty('--index', -currentTrackIndex.value)
      currentTrack = tracks[currentTrackIndex.value]
      resetPlayer()
    }
  }
  const resetPlayer = () => {
    barWidth.value = 0
    audio.value.currentTime = 0
    audio.value.src = currentTrack.source
    setTimeout(() => {
      if (isTimerPlaying.value) {
        audio.value && audio.value.play()
      } else {
        audio.value.pause()
      }
    }, 300)
  }
  const nextTrack = () => {
    if (currentTrackIndex.value < tracks.length - 1) {
      currentTrackIndex.value++
      if (tracksImgs.length < tracks.length) {
        if (!tracksImgs.find((item) => item.name === tracks[currentTrackIndex.value].name)) {
          tracksImgs.push(tracks[currentTrackIndex.value])
        }
      }
      playImgsRef.value.style.setProperty('--index', -currentTrackIndex.value)
    } else {
      currentTrackIndex.value = 0
      playImgsRef.value.style.setProperty('--index', -currentTrackIndex.value)
    }
    currentTrack = tracks[currentTrackIndex.value]
    resetPlayer()
  }
  const touchPlay = (e: any) => {
    e.preventDefault()
    if (audio.value.paused) {
      audio.value.play()
      isTimerPlaying.value = true
    } else {
      audio.value.pause()
      isTimerPlaying.value = false
    }
  }
  const play = () => {
    if (audio.value.paused) {
      if (!audio.value.src) {
        audio.value.src = currentTrack.source
      }
      audio.value.play()
      isTimerPlaying.value = true
    } else {
      audio.value.pause()
      isTimerPlaying.value = false
    }
  }
  const generateTime = () => {
    let width = (100 / audio.value.duration) * audio.value.currentTime
    barWidth.value = width + '%'
    let durmin: any = Math.floor(audio.value.duration / 60)
    let dursec: any = Math.floor(audio.value.duration - durmin * 60)
    let curmin: any = Math.floor(audio.value.currentTime / 60)
    let cursec: any = Math.floor(audio.value.currentTime - curmin * 60)
    if (durmin < 10) {
      durmin = '0' + durmin
    }
    if (dursec < 10) {
      dursec = '0' + dursec
    }
    if (curmin < 10) {
      curmin = '0' + curmin
    }
    if (cursec < 10) {
      cursec = '0' + cursec
    }
    if (isNaN(durmin) || isNaN(dursec) || isNaN(curmin) || isNaN(cursec)) {
      return
    }
    duration.value = durmin + ':' + dursec
    currentTime.value = curmin + ':' + cursec
  }
  const updateBar = (x: any) => {
    const { left, width }: any = progress.value && progress.value.getBoundingClientRect()
    const clickPos = x - left
    let percent = (clickPos / width) * 100
    if (percent >= 50) {
      isRight.value = true
    } else {
      isRight.value = false
    }
    if (percent >= 100) {
      percent = 100
      return
    }
    const audioPos = (audio.value.duration / 100) * percent
    if (isNaN(audioPos)) return
    audio.value.currentTime = audioPos
    barWidth.value = percent + '%'
  }
  const startDrag = (e: any) => {
    e.preventDefault()
    window.addEventListener('mousemove', updateDrag)
    window.addEventListener('mouseup', stopDrag)
  }
  const updateDrag = (e: any) => {
    audio.value.pause()
    updateBar(e.clientX)
  }
  const stopDrag = () => {
    if (isTimerPlaying.value) {
      audio.value.play()
    }
    window.removeEventListener('mousemove', updateDrag)
    window.removeEventListener('mouseup', stopDrag)
  }
  const touchStartDrag = (e: any) => {
    if (e.cancelable) {
      e.preventDefault()
    }
    window.addEventListener('touchmove', touchUpdateDrag)
    window.addEventListener('touchend', touchStopDrag)
  }
  const touchUpdateDrag = (e: any) => {
    audio.value.pause()
    updateBar(e.touches[0].clientX)
  }
  const touchStopDrag = () => {
    if (isTimerPlaying.value) {
      audio.value.play()
    }
    window.removeEventListener('touchmove', touchUpdateDrag)
    window.removeEventListener('touchend', touchStopDrag)
  }
  onBeforeUnmount(() => {
    audio.value.pause()
    audio.value.currentTime = 0
  })
</script>
<template>
  <div
    class="lg:w-[500px] lg:h-[600px] w-[98%] mx-auto h-[70vh] lg:rounded-lg shadow-md bg-white dark:bg-gray-800 select-none"
  >
    <div class="h-[75%] w-full relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 z-10 -translate-x-[50%] -translate-y-[50%]">
        <div
          class="text-white cursor-pointer text-8xl"
          :class="[isTimerPlaying ? ' hidden' : 'block']"
          @click="play"
          @touchstart.stop.prevent="touchPlay"
        >
          <div class="i-material-symbols:play-arrow-rounded"></div>
        </div>
        <div
          class="text-white cursor-pointer text-8xl"
          :class="[isTimerPlaying ? ' block' : ' hidden']"
          @click="play"
          @touchstart.stop.prevent="touchPlay"
        >
          <div class="i-material-symbols:pause-rounded"></div>
        </div>
      </div>
      <div class="absolute top-2 left-2 z-10">
        <span class="text-white cursor-pointer">
          <span class="material-symbols:queue-music" size="3em"></span>
        </span>
      </div>
      <div ref="playImgsRef" class="play-imgs h-full w-full flex brightness-75 will-change-auto">
        <img
          v-for="(item, index) in tracksImgs"
          :key="index"
          class="w-full rounded flex-shrink-0 object-cover"
          :src="item.cover"
          alt="item.name"
        />
      </div>
    </div>
    <div class="lg:px-4 px-1">
      <div class="w-full flex items-center justify-between pt-4 text-gray-500">
        <div
          @click="prevTrack"
          @touchstart.stop.prevent="prevTrack"
          class="i-material-symbols:skip-previous-rounded cursor-pointer text-6xl"
        ></div>
        <div class="w-[60%] text-center flex flex-col">
          <div class="text-2xl whitespace-nowrap overflow-hidden text-black dark:text-white">
            <div v-if="tracks[currentTrackIndex].name.length <= 12">
              {{ tracks[currentTrackIndex].name }}
            </div>
            <div v-else class="text-scroll">
              <span>{{ tracks[currentTrackIndex].name }}</span>
              <span>{{ tracks[currentTrackIndex].name }}</span>
            </div>
          </div>
          <div class="w-[80%] mx-auto text-gray-500 text-base overflow-hidden whitespace-nowrap">
            {{ tracks[currentTrackIndex].artist }}
          </div>
        </div>

        <div
          @click="nextTrack"
          @touchstart.stop.prevent="nextTrack"
          class="i-material-symbols:skip-next-rounded cursor-pointer text-6xl"
        ></div>
      </div>
      <div ref="progress" class="w-full pt-4">
        <div class="flex justify-between">
          <div>{{ currentTime }}</div>
          <div>{{ duration }}</div>
        </div>
        <div
          class="bg-black/10 dark:bg-white/60 h-[6px] rounded cursor-pointer"
          @click="updateBar($event.clientX)"
          @touchstart.stop.prevent="touchUpdateDrag($event)"
        >
          <div class="bg-pink-300 h-full w-[0%] relative rounded" :style="{ width: barWidth }">
            <span
              ref="circle"
              :class="isRight ? '-right-1' : '-right-3'"
              class="absolute -right-3 top-1/2 -mt-[6px] rounded-full w-3 h-3 bg-pink-400"
              @mousedown="startDrag"
              @touchstart.stop="touchStartDrag"
              @touchmove.stop="touchUpdateDrag"
              @touchend.stop="touchStopDrag"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .text-scroll {
    --subtitle-gap: 1rem;
    display: flex;
    gap: 0 var(--subtitle-gap);
    animation: subtitle 12s 1.2s linear infinite;
  }
  @keyframes subtitle {
    50%,
    100% {
      transform: translate3d(calc((100% + var(--subtitle-gap)) / -1), 0, 0);
    }
  }
  .play-imgs {
    --duration: 1s;
    --ease-slider: cubic-bezier(0.4, 0, 0.2, 1);
    transform: translate3d(calc(var(--index) * 100%), 0, 0);
    transition: var(--duration) transform var(--ease-slider);
  }
  .play-imgs img {
    -webkit-user-drag: none;
  }
</style>
