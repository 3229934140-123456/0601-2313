import { create } from 'zustand'
import type { Course, Enrollment } from '../types'
import { courses as initialCourses, enrollments as initialEnrollments } from '../data/courses'

const STORAGE_KEY = 'course-store-v1'

const loadCourseState = (): { courses: Course[]; enrollments: Enrollment[] } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.courses && data.enrollments) {
        return { courses: data.courses, enrollments: data.enrollments }
      }
    }
  } catch {}
  return { courses: [...initialCourses], enrollments: [...initialEnrollments] }
}

interface CourseState {
  courses: Course[]
  enrollments: Enrollment[]
  enrollCourse: (courseId: string, memberId: string) => { success: boolean; message: string }
  isEnrolled: (courseId: string, memberId: string) => boolean
  getEnrollmentsByMember: (memberId: string) => Enrollment[]
}

export const useCourseStore = create<CourseState>((set, get) => {
  const initial = loadCourseState()
  return {
    courses: initial.courses,
    enrollments: initial.enrollments,

    enrollCourse: (courseId: string, memberId: string) => {
      const state = get()
      const course = state.courses.find((c) => c.id === courseId)
      if (!course) return { success: false, message: '课程不存在' }
      if (course.enrolled >= course.capacity) return { success: false, message: '课程已满员' }
      if (state.isEnrolled(courseId, memberId)) return { success: false, message: '您已报名该课程' }

      const enrollment: Enrollment = {
        id: `e${Date.now()}`,
        memberId,
        courseId,
        status: '已报名',
        createdAt: new Date().toISOString(),
      }

      set({
        courses: state.courses.map((c) =>
          c.id === courseId ? { ...c, enrolled: c.enrolled + 1 } : c
        ),
        enrollments: [enrollment, ...state.enrollments],
      })

      return { success: true, message: '报名成功' }
    },

    isEnrolled: (courseId: string, memberId: string) => {
      return get().enrollments.some((e) => e.courseId === courseId && e.memberId === memberId)
    },

    getEnrollmentsByMember: (memberId: string) => {
      return get().enrollments.filter((e) => e.memberId === memberId)
    },
  }
})

useCourseStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      courses: state.courses,
      enrollments: state.enrollments,
    }))
  } catch {}
})

