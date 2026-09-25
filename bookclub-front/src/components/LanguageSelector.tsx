import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectGroup, SelectValue, SelectTrigger, SelectSeparator } from '@/components/ui/select'
import { Languages } from "lucide-react"

const LanguageSelector = () => {
    return (
        <Card className='border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur'>
            <CardHeader className='border-b border-border/60 py-4 sm:py-2'>
                <CardTitle className='text-xl sm:text-2xl flex items-center gap-2'>
                    <Languages className='w-5 h-5' />
                    Language
                </CardTitle>
                <CardDescription>
                    Change website language
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Select onValueChange={(value) => console.log(value)}>
                    <SelectTrigger className='w-full min-w-0'>
                        <SelectValue placeholder="English" />
                    </SelectTrigger>
                    <SelectContent position='popper' className='w-(--radix-select-trigger-width) min-w-0'>
                        <SelectGroup className='py-4 sm:py-4'>
                            <SelectItem value='en'>
                                English
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value='fi'>
                                Finnish
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value='se'>
                                Swedish
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    )
}

export default LanguageSelector
