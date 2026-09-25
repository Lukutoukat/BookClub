import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectGroup, SelectValue, SelectTrigger, SelectSeparator } from '@/components/ui/select'
import { Languages } from "lucide-react"

const LanguageSelector = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Languages />
                    Language
                </CardTitle>
                <CardDescription>
                    Change website language
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Select>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
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
