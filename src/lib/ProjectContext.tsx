import React, { createContext, useContext, useState, useEffect } from "react"
import { listProjects } from "./scrawn-server"

interface ProjectContextType {
  activeProjectId: string | null
  setActiveProjectId: (id: string) => void
  projects: string[]
  loading: boolean
}

const ProjectContext = createContext<ProjectContextType>({
  activeProjectId: null,
  setActiveProjectId: () => {},
  projects: [],
  loading: true,
})

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [projects, setProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    listProjects()
      .then((projIds) => {
        if (!mounted) return
        setProjects(projIds)
        if (projIds.length > 0) {
          if (!activeProjectId || !projIds.includes(activeProjectId)) {
            setActiveProjectId(projIds[0])
          }
        }
        setLoading(false)
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [activeProjectId])

  return (
    <ProjectContext.Provider
      value={{ activeProjectId, setActiveProjectId, projects, loading }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  return useContext(ProjectContext)
}
