import { useCallback } from "react"
import { useDispatch } from "react-redux"
import logOut from "../features/logOut"
import { setUserdata } from "../redux/userSlice"

export function useLogout() {
  const dispatch = useDispatch()

  return useCallback(async () => {
    try {
      await logOut()
    } finally {
      dispatch(setUserdata(null))
    }
  }, [dispatch])
}
