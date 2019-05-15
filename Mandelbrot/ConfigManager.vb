Imports Microsoft.Win32

Public Class ConfigManager
    Public ReadOnly Property PaletteSelected As Integer

    Public ReadOnly Property Speed As Double

    Private Shared inst As New ConfigManager()

    Public Shared ReadOnly Property Instance As ConfigManager
        Get
            Return inst
        End Get
    End Property

    Public Sub New()
        ' Get the values stored in the Registry
        Dim key As RegistryKey = Registry.CurrentUser.OpenSubKey("SOFTWARE\\Mandelbrot_ScreenSaver")
        If key Is Nothing Then
            PaletteSelected = 1
            Speed = 1.0
        Else
            PaletteSelected = Integer.Parse(key.GetValue("paletteSelected"))
            Speed = Math.Pow(2, Double.Parse(key.GetValue("speed")))
        End If
    End Sub
End Class
