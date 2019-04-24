Imports OpenTK
Imports OpenTK.Graphics
Imports OpenTK.Graphics.OpenGL4
Imports OpenTK.Input

Public Class Screensaver
    Inherits GameWindow

    Private time As Double

    Private mandelbrotShader As Shader
    Private screenQuadRenderer As ScreenQuadRenderer

    ' Randomises the zoom point the screensaver starts on
    Private zoomPointSeed As Integer

    Private Const NUM_FRACTAL_ZOOM_POINTS As Integer = 5

    Public Sub New()
        MyBase.New(DisplayDevice.Default.Width, DisplayDevice.Default.Height,
                   GraphicsMode.Default,
                   "Screensaver",
                   GameWindowFlags.Default,
                   DisplayDevice.Default, 4, 4,
                   GraphicsContextFlags.Debug)
        VSync = VSyncMode.On
        prevMouseX = 0
        prevMouseY = 0
        time = 0
        zoomPointSeed = New Random().Next() Mod NUM_FRACTAL_ZOOM_POINTS
    End Sub

    Protected Overrides Sub OnLoad(e As EventArgs)
        MyBase.OnLoad(e)

        GL.ClearColor(0.0, 0.0, 0.0, 0.0)

        mandelbrotShader = New Shader("mandelbrot.vert", "mandelbrot.frag")
        screenQuadRenderer = New ScreenQuadRenderer()
    End Sub

    Protected Overrides Sub OnResize(e As EventArgs)
        GL.Viewport(0, 0, Width, Height)
    End Sub

    Private prevMouseX As Integer
    Private prevMouseY As Integer
    Protected Overrides Sub OnUpdateFrame(e As FrameEventArgs)
        MyBase.OnUpdateFrame(e)

        Dim cursorState = Mouse.GetCursorState

        ' If mouse is moved, close screensaver
        'If prevMouseX <> cursorState.X Or prevMouseY <> cursorState.Y _
        '       And prevMouseX <> 0 Or prevMouseY <> 0 Then
        '   [Exit]()
        'End If
        prevMouseX = cursorState.X
        prevMouseY = cursorState.Y

        ' If any key is pressed, close screensaver
        'HandleKeyboard()
    End Sub

    Private Sub HandleKeyboard()
        Dim keyState = Keyboard.GetState()

        If keyState.IsAnyKeyDown Then
            [Exit]()
        End If
    End Sub

    Protected Overrides Sub OnRenderFrame(e As FrameEventArgs)
        MyBase.OnRenderFrame(e)

        time += e.Time

        Dim resolution As Vector3 = New Vector3(DisplayDevice.Default.Width, DisplayDevice.Default.Height, 1.0)
        mandelbrotShader.Use()

        mandelbrotShader.SetVec3("iResolution", resolution)
        mandelbrotShader.SetFloat("iTime", time)
        mandelbrotShader.SetInt("zoomPointSeed", zoomPointSeed)
        mandelbrotShader.SetInt("selectedPalette", 1)

        screenQuadRenderer.Render()

        SwapBuffers()
    End Sub

End Class