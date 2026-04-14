namespace RentalPlatform.Business.Exceptions;

public class UnauthorizedBusinessException : Exception
{
    public UnauthorizedBusinessException() { }

    public UnauthorizedBusinessException(string message) : base(message) { }

    public UnauthorizedBusinessException(string message, Exception innerException) : base(message, innerException) { }
}
