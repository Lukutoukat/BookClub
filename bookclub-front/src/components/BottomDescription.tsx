import logo from '@/assets/logo.png'


export const BottomDescription = () => {
  return (
    <div className="flex w-full justify-center">
      <img
        src={logo}
        alt="BookClub"
        className="block w-32 h-auto object-contain"
      />
    </div>
  )
}