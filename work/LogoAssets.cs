using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class LogoAssets
{
    public static void RecolorGradient(
        string input,
        string output,
        Rectangle contentBounds,
        Color startColor,
        Color endColor)
    {
        using (var source = new Bitmap(input))
        using (var destination = NewTransparentBitmap(source.Width, source.Height))
        {
            var denominator = Math.Max(1, contentBounds.Width + contentBounds.Height);

            for (var y = 0; y < source.Height; y++)
            {
                for (var x = 0; x < source.Width; x++)
                {
                    var original = source.GetPixel(x, y);
                    if (original.A == 0)
                    {
                        destination.SetPixel(x, y, Color.Transparent);
                        continue;
                    }

                    var progress = ((x - contentBounds.Left) + (y - contentBounds.Top)) / (double)denominator;
                    progress = Math.Max(0, Math.Min(1, progress));
                    var red = (int)Math.Round(startColor.R + ((endColor.R - startColor.R) * progress));
                    var green = (int)Math.Round(startColor.G + ((endColor.G - startColor.G) * progress));
                    var blue = (int)Math.Round(startColor.B + ((endColor.B - startColor.B) * progress));

                    destination.SetPixel(x, y, Color.FromArgb(original.A, red, green, blue));
                }
            }

            destination.Save(output, ImageFormat.Png);
        }
    }

    public static string AlphaBounds(string input, int left, int top, int right, int bottom, byte threshold)
    {
        using (var bitmap = new Bitmap(input))
        {
            var minX = bitmap.Width;
            var minY = bitmap.Height;
            var maxX = -1;
            var maxY = -1;

            left = Math.Max(0, left);
            top = Math.Max(0, top);
            right = Math.Min(bitmap.Width, right);
            bottom = Math.Min(bitmap.Height, bottom);

            for (var y = top; y < bottom; y++)
            {
                for (var x = left; x < right; x++)
                {
                    if (bitmap.GetPixel(x, y).A <= threshold) continue;
                    minX = Math.Min(minX, x);
                    minY = Math.Min(minY, y);
                    maxX = Math.Max(maxX, x);
                    maxY = Math.Max(maxY, y);
                }
            }

            return maxX < 0 ? "none" : string.Format("{0},{1},{2},{3}", minX, minY, maxX, maxY);
        }
    }

    public static void ExportHeader(string input, string output, Rectangle crop, int outputWidth)
    {
        var ratio = outputWidth / (double)crop.Width;
        var outputHeight = (int)Math.Round(crop.Height * ratio);

        using (var source = new Bitmap(input))
        using (var destination = NewTransparentBitmap(outputWidth, outputHeight))
        using (var graphics = Graphics.FromImage(destination))
        {
            Configure(graphics);
            graphics.DrawImage(source, new Rectangle(0, 0, outputWidth, outputHeight), crop, GraphicsUnit.Pixel);
            destination.Save(output, ImageFormat.Png);
        }
    }

    public static void ExportSquareSymbol(string input, string output, Rectangle symbolCrop, int size)
    {
        ExportSquareSymbolInternal(input, output, symbolCrop, size, Color.Transparent);
    }

    public static void ExportSquareSymbolOnBackground(string input, string output, Rectangle symbolCrop, int size)
    {
        ExportSquareSymbolInternal(input, output, symbolCrop, size, Color.FromArgb(243, 243, 247));
    }

    private static void ExportSquareSymbolInternal(string input, string output, Rectangle symbolCrop, int size, Color background)
    {
        using (var source = new Bitmap(input))
        using (var destination = NewTransparentBitmap(size, size))
        using (var graphics = Graphics.FromImage(destination))
        {
            Configure(graphics);
            graphics.Clear(background);
            var targetWidth = (int)(size * 0.82);
            var ratio = targetWidth / (double)symbolCrop.Width;
            var targetHeight = (int)Math.Round(symbolCrop.Height * ratio);

            if (targetHeight > size * 0.82)
            {
                targetHeight = (int)(size * 0.82);
                ratio = targetHeight / (double)symbolCrop.Height;
                targetWidth = (int)Math.Round(symbolCrop.Width * ratio);
            }

            var x = (size - targetWidth) / 2;
            var y = (size - targetHeight) / 2;
            graphics.DrawImage(source, new Rectangle(x, y, targetWidth, targetHeight), symbolCrop, GraphicsUnit.Pixel);
            destination.Save(output, ImageFormat.Png);
        }
    }

    public static void ExportSocial(string input, string output, Rectangle logoCrop)
    {
        const int width = 1200;
        const int height = 630;

        using (var source = new Bitmap(input))
        using (var destination = new Bitmap(width, height, PixelFormat.Format32bppArgb))
        using (var graphics = Graphics.FromImage(destination))
        {
            Configure(graphics);
            using (var background = new LinearGradientBrush(
                new Rectangle(0, 0, width, height),
                Color.FromArgb(245, 244, 251),
                Color.FromArgb(226, 229, 250),
                25f))
            {
                graphics.FillRectangle(background, 0, 0, width, height);
            }

            using (var glow = new SolidBrush(Color.FromArgb(28, 116, 92, 242)))
            {
                graphics.FillEllipse(glow, 245, 95, 710, 440);
            }

            var targetWidth = 720;
            var ratio = targetWidth / (double)logoCrop.Width;
            var targetHeight = (int)Math.Round(logoCrop.Height * ratio);
            var x = (width - targetWidth) / 2;
            var y = (height - targetHeight) / 2;
            graphics.DrawImage(source, new Rectangle(x, y, targetWidth, targetHeight), logoCrop, GraphicsUnit.Pixel);
            destination.Save(output, ImageFormat.Png);
        }
    }

    private static Bitmap NewTransparentBitmap(int width, int height)
    {
        var bitmap = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        bitmap.SetResolution(96, 96);
        return bitmap;
    }

    private static void Configure(Graphics graphics)
    {
        graphics.Clear(Color.Transparent);
        graphics.CompositingMode = CompositingMode.SourceOver;
        graphics.CompositingQuality = CompositingQuality.HighQuality;
        graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
        graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
        graphics.SmoothingMode = SmoothingMode.HighQuality;
    }
}
