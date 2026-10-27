import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const usePageTitle = (title: string, club?: string) => {
    const { t } = useTranslation()

    useEffect(() => {
        document.title = club
        ? t('labels.clubPageTitle', { page: title, club })
        : t('labels.pageTitle', { page: title }) 
    }, [title, club, t])
}
